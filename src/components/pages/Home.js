import { useSelector, useDispatch } from 'react-redux';
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { selectTables, fetchTables } from '../../redux/tablesRedux';

const Home = () => {
  const dispatch = useDispatch();
  const tables = useSelector(selectTables);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [history, setHistory] = useState([]);
  const statusOrder = ['Busy', 'Reserved', 'Cleaning', 'Free'];
  // Softer, modern badge colors instead of the default bright Bootstrap palette
  const statusVariant = {
    Busy: 'danger',
    Reserved: 'warning',
    Cleaning: 'info',
    Free: 'success',
  };

  const filteredTables = useMemo(() => {
    return tables.filter(table => {
      const matchesSearch =
        search.trim() === '' ||
        String(table.id).includes(search.trim()) ||
        table.status.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tables, search, statusFilter]);

  const sortedTables = [...filteredTables].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  );

  useEffect(() => {
    // Poll backend to capture changes from other users
    const id = setInterval(() => dispatch(fetchTables()), 5000);
    return () => clearInterval(id);
  }, [dispatch]);

  useEffect(() => {
    if (!tables.length) return;

    const counts = tables.reduce(
      (acc, table) => {
        if (acc[table.status] !== undefined) acc[table.status] += 1;
        return acc;
      },
      { Busy: 0, Reserved: 0, Cleaning: 0, Free: 0 }
    );

    setHistory(prev => {
      const last = prev[prev.length - 1];
      const sameAsLast = last && ['Busy', 'Reserved', 'Cleaning', 'Free'].every(key => last.counts[key] === counts[key]);
      if (sameAsLast) return prev;

      const timestamp = new Date();
      const next = [
        ...prev,
        { counts, timeLabel: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ];
      return next.slice(-20); // keep history short
    });
  }, [tables]);

  const totalTables = tables.length || 1; // avoid division by zero
  const busyTables = tables.filter(table => table.status === 'Busy');
  const occupancyPercent = Math.round(((busyTables.length / totalTables) * 100 + Number.EPSILON) * 10) / 10;
  const avgBusyBill = busyTables.length
    ? Math.round(
        (busyTables.reduce((sum, table) => sum + Number(table.bill || 0), 0) / busyTables.length + Number.EPSILON) * 100
      ) / 100
    : 0;

  return (
    <section>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <h1 className="mb-0">All tables</h1>
        <div className="d-flex gap-2">
          <Form.Control
            size="sm"
            placeholder="Search by id or status"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Form.Select
            size="sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {statusOrder.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      <div className="mb-4 p-3 border rounded bg-white shadow-sm">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <h5 className="mb-0">Obłożenie (live)</h5>
          {['Busy', 'Reserved', 'Cleaning', 'Free'].map(status => (
            <Badge key={status} bg={statusVariant[status] || 'secondary'}>
              {status}: {tables.filter(t => t.status === status).length}
            </Badge>
          ))}
        </div>
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3 small text-muted">
          <span>Obłożenie: <strong>{occupancyPercent}%</strong></span>
          <span>Średni rachunek (Busy): <strong>${avgBusyBill.toFixed(2)}</strong></span>
        </div>
        <div className="d-flex flex-column gap-2">
          {history.length === 0 ? (
            <small className="text-muted">Brak danych — odśwież lub zmień status stolika.</small>
          ) : (
            history.map((entry, idx) => {
              const segments = ['Busy', 'Reserved', 'Cleaning', 'Free'].map(status => {
                const percent = (entry.counts[status] / totalTables) * 100;
                const colors = {
                  Busy: '#d9534f',
                  Reserved: '#f0ad4e',
                  Cleaning: '#5bc0de',
                  Free: '#5cb85c',
                };
                return {
                  status,
                  percent,
                  color: colors[status],
                };
              });

              return (
                <div key={`${entry.timeLabel}-${idx}`} className="d-flex align-items-center gap-2">
                  <div
                    className="flex-grow-1 d-flex rounded overflow-hidden"
                    style={{ height: '10px', background: '#f1f3f5' }}
                  >
                    {segments.map(segment => (
                      <div
                        key={segment.status}
                        style={{
                          width: `${segment.percent}%`,
                          backgroundColor: segment.color,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    ))}
                  </div>
                  <small className="text-muted" style={{ width: '48px' }}>
                    {entry.timeLabel}
                  </small>
                </div>
              );
            })
          )}
        </div>
      </div>
      {sortedTables.map(table => (
        <div key={table.id} className="py-3 border-bottom">
          <Row className="align-items-center">
            <Col md={8}>
              <h4 className="mb-2 mb-md-0">
                Table {table.id}{' '}
                <Badge bg={statusVariant[table.status] || 'secondary'}>{table.status}</Badge>
              </h4>
            </Col>
            <Col md={4} className="text-md-end mt-2 mt-md-0">
              <Button as={Link} to={`/table/${table.id}`}>
                Show more
              </Button>
            </Col>
          </Row>
        </div>
      ))}
    </section>
  );
};

export default Home;
