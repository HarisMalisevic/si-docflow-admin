import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";

function AppNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Ovdje možete dodati logiku za brisanje tokena ili sesije
    navigate("/login"); // Preusmjeravanje na login formu
  };

  return (
    <>
      <Navbar expand="lg" bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">
            DocFlow
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/document-types">
                Document Types
              </Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link onClick={handleLogout} style={{ cursor: "pointer" }}>
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AppNavbar;
