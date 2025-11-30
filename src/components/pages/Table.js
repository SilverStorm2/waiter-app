import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import { selectTableById } from '../../redux/tablesRedux';

const Table = () => {
  const { id } = useParams();
  const table = useSelector(state => selectTableById(state, id));
  const [status, setStatus] = useState('');
  const [peopleAmount, setPeopleAmount] = useState(0);
  const [maxPeopleAmount, setMaxPeopleAmount] = useState(0);
  const [bill, setBill] = useState(0);

  useEffect(() => {
    if (table) {
      setStatus(table.status);
      setPeopleAmount(table.peopleAmount);
      setMaxPeopleAmount(table.maxPeopleAmount);
      setBill(table.bill);
    }
  }, [table]);

  if (!table) {
    return <p>Loading table...</p>;
  }

  const handleSubmit = e => {
    e.preventDefault();
    // placeholder for future update logic
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 bg-light rounded">
      <h2 className="mb-4">Table {id}</h2>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Status:</Form.Label>
        <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="Busy">Busy</option>
          <option value="Free">Free</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Reserved">Reserved</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">People:</Form.Label>
        <Row className="g-2 align-items-center">
          <Col xs="auto">
            <Form.Control
              type="number"
              value={peopleAmount}
              onChange={e => setPeopleAmount(Number(e.target.value))}
              min={0}
              max={maxPeopleAmount}
            />
          </Col>
          <Col xs="auto">/</Col>
          <Col xs="auto">
            <Form.Control
              type="number"
              value={maxPeopleAmount}
              onChange={e => setMaxPeopleAmount(Number(e.target.value))}
              min={1}
              max={10}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Bill:</Form.Label>
        <InputGroup>
          <InputGroup.Text>$</InputGroup.Text>
          <Form.Control
            type="number"
            value={bill}
            onChange={e => setBill(Number(e.target.value))}
            min={0}
          />
        </InputGroup>
      </Form.Group>

      <Button type="submit" variant="primary">
        Update
      </Button>
    </Form>
  );
};

export default Table;
