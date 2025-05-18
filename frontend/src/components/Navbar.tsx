import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router";
import { useEffect, useState } from "react"; 
import Dropdown from "react-bootstrap/Dropdown"; 
import HoverNavDropdown from "./HoverNavDropdown";

var NAV_BAR_LINKS = [
  { to: "/", label: "Home" },
  {
    label: "Documents",
    children: [
      { to: "/document-types", label: "Types" },
      { to: "/document-layouts", label: "Layouts" },
    ],
  },
  {
    label: "Processing Rules",
    children: [
      { to: "/processing-rules", label: "Rules" },
      { to: "/api-endpoints", label: "API Endpoints" },
      { to: "/ftp-endpoints", label: "FTP Endpoints" },
      { to: "/local-storage-folder", label: "Local Storage" },
    ],
  },
  { to: "/access-rights", label: "Access Rights" },
  {
    label: "Remote Processing",
    children: [
      { to: "/app-instance-manager", label: "Windows Clients" },
      { to: "/client-transaction-logs", label: "Client & Transaction Logs" },
      { to: "/processing-requests-billing-logs", label: "Processing & Billing Logs" },
    ],
  },
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

function AppNavbar() {
  const [user, setUser] = useState({
    email: "user@example.com",
    ssoProvider: "Google",
    isSuperAdmin: false,
    createdAt: "2024-03-15T10:00:00Z",
    role: "Admin"
  });


  useEffect(() => {

    isSuperAdmin().then((response) => {
      if (response.ok) {
        NAV_BAR_LINKS.push({ to: "/sso-providers", label: "SSO Providers" });
      }
    }).catch((error) => {
      console.error("Error checking super admin status:", error);
    });

    fetch("/auth/profile", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        const newRole = data.isSuperAdmin ? "Super Admin" : "Admin";

        setUser({
          ...data,
          role: newRole,
        });
      })
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
              {NAV_BAR_LINKS.map((link, index) => {
                if (link.children) {
                  return (
                    <HoverNavDropdown 
                      title={link.label}
                      items={link.children} 
                      id={`nav-dropdown-${index}`}
                    />
                  );          
                }
                else {
                  return (
                    <Nav.Link as={Link} to={link.to} key={index}>
                      {link.label}
                    </Nav.Link>
                  );
                }
              })}
            </Nav>

            <Nav>
              <Dropdown align="end">
                <Dropdown.Toggle variant="secondary" id="dropdown-user">
                  {user.email}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.ItemText><strong>SSO Provider:</strong> {user.ssoProvider}</Dropdown.ItemText>
                  <Dropdown.ItemText><strong>Role:</strong> {user.role}</Dropdown.ItemText>
                  <Dropdown.ItemText><strong>Created At:</strong> {new Date(user.createdAt).toLocaleDateString()}</Dropdown.ItemText>
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