import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Badge,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Alert,
} from "react-bootstrap";
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
  send_file: boolean;
}

const ApiEndpoints: React.FC = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActive, setShowActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchEndpoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/api-endpoints");
      if (!response.ok) {
        throw new Error(`Failed to fetch endpoints: ${response.statusText}`);
      }
      const data: ApiEndpoint[] = await response.json();
      setEndpoints(data);
    } catch (error: any) {
      console.error("Error fetching endpoints:", error);
      setError(error.message || "Failed to load endpoints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this endpoint? This may affect processing rules using it."
      )
    )
      return;
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/api-endpoints/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(errorData.message || "Failed to delete endpoint");
      }
      setSuccessMsg("Endpoint deleted successfully.");
      fetchEndpoints();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error: any) {
      console.error("Error deleting endpoint:", error);
      setError(error.message || "Failed to delete endpoint.");
    }
  };

  const toggleActive = async (endpoint: ApiEndpoint) => {
    setError(null);
    setSuccessMsg(null);
    const originalStatus = endpoint.is_active;
    setEndpoints((prev) =>
      prev.map((ep) =>
        ep.id === endpoint.id ? { ...ep, is_active: !ep.is_active } : ep
      )
    );

    const payload = {
      is_active: !endpoint.is_active,
    };

    try {
      const response = await fetch(`/api/api-endpoints/${endpoint.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(errorData.message || "Failed to update status");
      }
      setSuccessMsg(
        `Endpoint ${originalStatus ? "deactivated" : "activated"}.`
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error: any) {
      console.error("Toggle active error:", error);
      setError(error.message || "Failed to update status.");
      setEndpoints((prev) =>
        prev.map((ep) =>
          ep.id === endpoint.id ? { ...ep, is_active: originalStatus } : ep
        )
      );
    }
  };

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.base_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.route.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActive =
      showActive === null || endpoint.is_active === showActive;

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
    <Container fluid="md" className="py-3">
      <Row className="d-flex justify-content-center">
        <Col md={8} className="text-center">
          <h1>API Endpoints</h1>
        </Col>
      </Row>

      <Row className="mb-4 mt-5">
        <Col md={10} className="mx-auto">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {successMsg && (
            <Alert
              variant="success"
              onClose={() => setSuccessMsg(null)}
              dismissible
            >
              {successMsg}
            </Alert>
          )}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
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
                placeholder="Search endpoints..."
                className="me-2 flex-grow-1"
                style={{ minWidth: "300px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search endpoints"
              />
            </div>
            <Button
              variant="success"
              style={{ minWidth: "7rem" }}
              onClick={() => navigate("/api-endpoints/create")}
            >
              Add New
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={10} className="mx-auto">
          <Table striped bordered hover responsive="md" size="sm">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "15%" }}>Title</th>
                <th style={{ width: "20%" }}>Description</th>
                <th style={{ width: "23%" }}>Full URL</th>
                <th style={{ width: "9%", textAlign: "center" }}>Status</th>
                <th style={{ width: "9%", textAlign: "center" }}>Method</th>
                <th style={{ width: "9%", textAlign: "center" }}>Auth</th>
                <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((endpoint, index) => (
                  <tr key={endpoint.id}>
                    <td className="align-middle">{index + 1}</td>
                    <td className="align-middle">{endpoint.title}</td>
                    <td className="align-middle">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-desc-${endpoint.id}`}>
                            {endpoint.description || "No description"}
                          </Tooltip>
                        }
                      >
                        <span
                          style={{
                            display: "inline-block",
                            maxWidth: "100%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {endpoint.description || "-"}
                        </span>
                      </OverlayTrigger>
                    </td>
                    <td
                      className="align-middle"
                      style={{ wordBreak: "break-all" }}
                    >{`${endpoint.base_url}${endpoint.route}`}</td>
                    <td className="text-center align-middle">
                      <Badge
                        bg={endpoint.is_active ? "success" : "secondary"}
                        pill
                      >
                        {endpoint.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="text-center align-middle">
                      <Badge bg={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                    </td>
                    <td className="text-center align-middle">
                      <Badge bg={getAuthColor(endpoint.auth_type)}>
                        {endpoint.auth_type || "None"}
                      </Badge>
                    </td>
                    <td
                      className="text-center align-middle"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2 mb-1 mb-md-0"
                        onClick={() =>
                          navigate(`/api-endpoints/edit/${endpoint.id}`)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant={endpoint.is_active ? "warning" : "success"}
                        size="sm"
                        className="me-2 mb-1 mb-md-0"
                        onClick={() => toggleActive(endpoint)}
                      >
                        {endpoint.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
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
                    No endpoints match your criteria.
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
