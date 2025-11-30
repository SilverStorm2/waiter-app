import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { selectTables } from '../../redux/tablesRedux';

const Home = () => {
  const tables = useSelector(selectTables);

  return (
    <section>
      <h1 className="mb-4">All tables</h1>
      {tables.map(table => (
        <div key={table.id} className="py-3 border-bottom">
          <Row className="align-items-center">
            <Col md={8}>
              <h4 className="mb-2 mb-md-0">
                Table {table.id}{' '}
                <small className="fw-normal">
                  <strong>Status:</strong> {table.status}
                </small>
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
