import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface ApiEndpoint {
  id: number;
  title?: string;
  description?: string;
  is_active: boolean;
  auth_type?: "None" | "API_Key" | "Basic" | "Bearer" | "OAuth";
  method: string;
  base_url: string;
  route: string;
  query_parameters?: string;
  headers: string;
  body?: string;
  timeout_seconds: number;
}

const ApiEndpoints: React.FC = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActive, setShowActive] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const fetchEndpoints = async () => {
    try {
      const response = await fetch("/api/api-endpoints");
      const data: ApiEndpoint[] = await response.json();
      setEndpoints(data);
    } catch (error) {
      console.error("Error fetching endpoints:", error);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this endpoint?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/api-endpoints/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEndpoints();
      } else {
        console.error("Failed to delete endpoint");
      }
    } catch (error) {
      console.error("Error deleting endpoint:", error);
    }
  };

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.base_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.route.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActive = showActive === null || endpoint.is_active === showActive;

    return matchesSearch && matchesActive;
  });

  return (
    <Container fluid="md" className="py-3">
      <Row className="d-flex justify-content-center">
        <Col md={8} className="text-center">
          <h1>API Endpoints</h1>
        </Col>
      </Row>

      <Row className="mb-4" style={{ marginTop: "70px" }}>
        <Col md={8} className="mx-auto">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex">
              <Form.Select
                className="me-2"
                style={{ width: "130px" }}
                value={showActive === null ? "all" : showActive ? "active" : "inactive"}
                onChange={(e) => {
                  const val = e.target.value;
                  setShowActive(val === "all" ? null : val === "active");
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
              <Form.Control
                type="text"
                placeholder="Search endpoints"
                className="me-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="success"
              style={{ width: "7rem" }}
              onClick={() => navigate("/api-endpoints/create")}
            >
              Add New
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8} className="mx-auto">
          <Table striped bordered hover responsive="md">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Full URL</th>
                <th>Status</th>
                <th>Method</th>
                <th>Auth</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((endpoint, index) => (
                  <tr key={endpoint.id}>
                    <td>{index + 1}</td>
                    <td>{endpoint.title}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{endpoint.description}</Tooltip>}
                      >
                        <span style={{ display: 'inline-block', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {endpoint.description}
                        </span>
                      </OverlayTrigger>
                    </td>
                    <td>{`${endpoint.base_url}${endpoint.route}`}</td>
                    <td>
                      <Badge bg={endpoint.is_active ? "success" : "secondary"}>
                        {endpoint.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                    </td>
                    <td>
                      <Badge bg={getAuthColor(endpoint.auth_type)}>{endpoint.auth_type}</Badge>
                    </td>
                    <td className="text-center align-middle" style={{ whiteSpace: "nowrap" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        style={{ width: "75px" }}
                        onClick={() => navigate(`/api-endpoints/edit/${endpoint.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        style={{ width: "75px" }}
                        onClick={() => handleDelete(endpoint.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    No endpoints available.
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

function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "primary";
    case "POST":
      return "success";
    case "PUT":
      return "warning";
    case "PATCH":
      return "info";
    case "DELETE":
      return "danger";
    default:
      return "secondary";
  }
}

function getAuthColor(authType?: string): string {
  switch (authType) {
    case "None":
      return "secondary";
    case "API_Key":
      return "info";
    case "Basic":
      return "primary";
    case "Bearer":
      return "success";
    case "OAuth":
      return "warning";
    default:
      return "secondary";
  }
}

export default ApiEndpoints;
