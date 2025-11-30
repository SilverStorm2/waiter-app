import { useSelector } from 'react-redux';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { selectTables } from '../../redux/tablesRedux';

const Home = () => {
  const tables = useSelector(selectTables);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const statusOrder = ['Busy', 'Reserved', 'Cleaning', 'Free'];
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
