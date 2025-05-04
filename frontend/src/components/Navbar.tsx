import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import { useState } from "react"; // dodano
import Dropdown from "react-bootstrap/Dropdown"; // dodano

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

let CURRENT_USER = {
  email: "user@example.com",
  ssoProvider: "Google",
  ssoId: "abc123xyz",
  isSuperAdmin: false,
  createdAt: "2024-03-15T10:00:00Z"
};

async function fetchUserProfile() {
  try {
    const response = await fetch("/api/auth/profile", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userData = await response.json();

    userData.isSuperAdmin = userData.isSuperAdmin ? "Super Admin" : "Admin";

    CURRENT_USER = userData;
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

isSuperAdmin().then((response) => {
  if (response.ok) {
    NAV_BAR_LINKS.push({ to: "/sso-providers", label: "SSO Providers" });
  }
}).catch((error) => {
  console.error("Error checking super admin status:", error);
});

function AppNavbar() {

  fetchUserProfile();

  const [showSsoId, setShowSsoId] = useState(false); // za show/hide
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
              <Dropdown align="end">
                <Dropdown.Toggle variant="secondary" id="dropdown-user">
                  {CURRENT_USER.email}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.ItemText><strong>SSO Provider:</strong> {CURRENT_USER.ssoProvider}</Dropdown.ItemText>
                  <Dropdown.ItemText>
                    <strong>SSO ID:</strong> {showSsoId ? CURRENT_USER.ssoId : "•••••••••"}{" "}
                    <button
                      style={{ border: "none", background: "none", color: "#0d6efd", cursor: "pointer", fontSize: "0.8rem" }}
                      onClick={() => setShowSsoId(!showSsoId)}
                    >
                      {showSsoId ? "Hide" : "Show"}
                    </button>
                  </Dropdown.ItemText>
                  <Dropdown.ItemText><strong>Role:</strong> {CURRENT_USER.isSuperAdmin}</Dropdown.ItemText>
                  <Dropdown.ItemText><strong>Created At:</strong> {new Date(CURRENT_USER.createdAt).toLocaleDateString()}</Dropdown.ItemText>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Log out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AppNavbar;