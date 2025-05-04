import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";

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
  const [user, setUser] = useState<any>(null);

  const [showSsoId, setShowSsoId] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/auth/profile", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => console.error("Failed to load user profile:", err));
  }, []);

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
    <Navbar expand="lg" bg="dark" variant="dark" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">DocFlow</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {NAV_BAR_LINKS.map((link, index) => (
              <Nav.Link as={Link} to={link.to} key={index}>{link.label}</Nav.Link>
            ))}
          </Nav>
          <Nav>
            {user && (
              <Dropdown align="end">
                <Dropdown.Toggle variant="secondary" id="dropdown-user">
                  {user.email}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.ItemText><strong>SSO Provider:</strong> {user.ssoProvider}</Dropdown.ItemText>
                  <Dropdown.ItemText>
                    <strong>SSO ID:</strong> {showSsoId ? user.ssoId : "•••••••••"}{" "}
                    <button 
                      style={{ border: "none", background: "none", color: "#0d6efd", cursor: "pointer", fontSize: "0.8rem" }}
                      onClick={() => setShowSsoId(!showSsoId)}
                    >
                      {showSsoId ? "Hide" : "Show"}
                    </button>
                  </Dropdown.ItemText>
                  <Dropdown.ItemText><strong>Role:</strong> {user.role}</Dropdown.ItemText>
                  <Dropdown.ItemText><strong>Created At:</strong> {new Date(user.createdAt).toLocaleDateString()}</Dropdown.ItemText>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Log out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
