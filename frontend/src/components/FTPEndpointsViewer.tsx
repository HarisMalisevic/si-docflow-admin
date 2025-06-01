import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Table,
    Badge,
    Spinner,
  } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface ExternalFTPEndpoint {
  id: number;
  title?: string;
  description?: string;
  host: string;
  port: number;
  username: string;
  is_active: boolean;
  secure: boolean;
  path: string;
  created_by: number;
  updated_by?: number;
}

const ExternalFTPEndpoints: React.FC = () => {
  const [endpoints, setEndpoints] = useState<ExternalFTPEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActive, setShowActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchEndpoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ftp-endpoints");
      if (!response.ok) throw new Error("Failed to load FTP endpoints");
      const data: ExternalFTPEndpoint[] = await response.json();
      setEndpoints(data);
    } catch (err: any) {
      setError(err.message || "Error loading FTP endpoints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this FTP endpoint?")) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/ftp-endpoints/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete");
      }

      setSuccessMsg("FTP endpoint deleted successfully.");
      fetchEndpoints();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete endpoint.");
    }
  };

  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesSearch = [ep.title, ep.description, ep.host, ep.path]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesActive =
      showActive === null ? true : ep.is_active === showActive;

    return matchesSearch && matchesActive;
  });

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4" fluid="md">
      <Row className="d-flex justify-content-center">
        <Col md={8} className="text-center">
          <h1>External FTP Endpoints</h1>
        </Col>
      </Row>

      <Row className="mb-4 mt-5">
        <Col md={10} className="mx-auto">
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
            <div className="d-flex">
              <Form.Select
                className="me-2"
                style={{ width: "auto", minWidth: "120px" }}
                value={
                  showActive === null
                    ? "all"
                    : showActive
                    ? "active"
                    : "inactive"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setShowActive(val === "all" ? null : val === "active");
                }}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
              <Form.Control
                type="text"
                className="me-2 flex-grow-1"
                placeholder="Search FTP endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: "300px" }}
              />
            </div>
            <Button variant="success" onClick={() => navigate("/ftp-endpoints/create")}>
              Add New
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          {successMsg && (
            <div className="alert alert-success">{successMsg}</div>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{width: '5%'}}>#</th>
                <th style={{width: '15%'}}>Title</th>
                <th style={{width: '20%'}}>Description</th>
                <th style={{width: '10%'}}>Host</th>
                <th style={{width: '10%'}}>Port</th>
                <th style={{width: '8%', textAlign: "center"}}>Active</th>
                <th style={{width: '8%', textAlign: "center"}}>Secure</th>
                <th style={{width: '10%', textAlign: "center"}}>Path</th>
                <th style={{width: '10%', textAlign: "center"}}>User</th>
                <th style={{width: '10%', textAlign: "center"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((ep, index) => (
                  <tr key={ep.id}>
                    <td>{index + 1}</td>
                    <td>{ep.title || "-"}</td>
                    <td>{ep.description || "-"}</td>
                    <td>{ep.host}</td>
                    <td>{ep.port}</td>
                    <td className="text-center">
                      <Badge bg={ep.is_active ? "success" : "secondary"}>
                        {ep.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg={ep.secure ? "success" : "secondary"}>
                        {ep.secure ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td>{ep.path}</td>
                    <td>{ep.username}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/ftp-endpoints/edit/${ep.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(ep.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">
                    No FTP endpoints found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default ExternalFTPEndpoints;
