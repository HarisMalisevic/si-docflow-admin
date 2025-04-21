import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";

var NAV_BAR_LINKS = [
  { to: "/", label: "Home" },
  { to: "/document-types", label: "Types" },
  { to: "/document-layouts", label: "Layouts" },
  { to: "/access-rights", label: "Access Rights" }
];

async function isSuperAdmin() {
  return await fetch("/api/auth/status/super", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

isSuperAdmin().then((response) => {
  if (response.ok) {
    NAV_BAR_LINKS.push({ to: "/sso-providers", label: "SSO Providers" });
  }
}).catch((error) => {
  console.error("Error checking super admin status:", error);
});



function AppNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Logout failed");
        }
        console.log("Successfully logged out");
      })
      .then(() => {
        window.location.reload(); // Refresh the site
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
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
              {NAV_BAR_LINKS.map((link, index) => (
                <Nav.Link as={Link} to={link.to} key={index}>
                  {link.label}
                </Nav.Link>
              ))}
            </Nav>
            <Nav>
              <Nav.Link onClick={handleLogout} style={{ cursor: "pointer" }}>
                Log out
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AppNavbar;
