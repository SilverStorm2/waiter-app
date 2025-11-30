import { Navbar, Nav, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const NavBar = () => (
  <Navbar bg="primary" variant="dark" expand="md" className="my-4 rounded" data-bs-theme="dark">
    <Container>
      <Navbar.Brand as={NavLink} to="/">
        Waiter.App
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="main-nav" />
      <Navbar.Collapse id="main-nav">
        <Nav className="ms-auto">
          <Nav.Link as={NavLink} to="/" end>
            Home
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default NavBar;
