import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

interface Destination {
  id: number;
  processing_rule_id: number;
  external_api_endpoint_id?: number;
  external_ftp_endpoint_id?: number;
  local_storage_folder_id?: number;
  is_active: boolean;
}
interface APIEndpoint {
  id: number;
  title: string;
}
interface FTPEndpoint {
  id: number;
  title: string;
}
interface LocalFolder {
  id: number;
  title: string;
}

type DestinationType = "api" | "ftp" | "local" | "";

const ProcessingRuleDestinationViewer: React.FC = () => {
  const { id: ruleId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [apis, setApis] = useState<APIEndpoint[]>([]);
  const [ftps, setFtps] = useState<FTPEndpoint[]>([]);
  const [locals, setLocals] = useState<LocalFolder[]>([]);
  const [selectedType, setSelectedType] = useState<DestinationType>("");
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [ruleId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allDestRes, apiRes, ftpRes, localRes] = await Promise.all([
        fetch("/api/processing-rules/destinations"),
        fetch("/api/api-endpoints"),
        fetch("/api/ftp-endpoints"),
        fetch("/api/local-storage-folder"),
      ]);
      const allDest: Destination[] = await allDestRes.json();
      setDestinations(
        allDest.filter((d) => d.processing_rule_id === Number(ruleId))
      );
      setApis(await apiRes.json());
      setFtps(await ftpRes.json());
      setLocals(await localRes.json());
    } catch (err) {
      console.error(err);
      setErrors("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedType("");
    setSelectedId("");
    setErrors(null);
  };

  const validate = () => {
    if (!selectedType || !selectedId) {
      setErrors("Select both destination type and destination");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: any = {
      processing_rule_id: Number(ruleId),
      api_id: selectedType === "api" ? selectedId : null,
      ftp_id: selectedType === "ftp" ? selectedId : null,
      local_folder_id: selectedType === "local" ? selectedId : null,
    };

    try {
      const res = await fetch("/api/processing-rules/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSuccess("Destination added");
      resetForm();
      fetchAll();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setErrors("Failed to create destination");
    }
  };

  const handleToggle = async (d: Destination) => {
    try {
      await fetch(`/api/processing-rules/destinations/${d.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processing_rule_id: Number(ruleId),
          api_id: d.external_api_endpoint_id,
          ftp_id: d.external_ftp_endpoint_id,
          local_folder_id: d.local_storage_folder_id,
          is_active: !d.is_active,
        }),
      });
      setDestinations((prev) =>
        prev.map((x) => (x.id === d.id ? { ...x, is_active: !x.is_active } : x))
      );
    } catch {
      setErrors("Failed to toggle active");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this destination?")) return;
    try {
      await fetch(`/api/processing-rules/destinations/${id}`, {
        method: "DELETE",
      });
      setDestinations((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setErrors("Failed to delete");
    }
  };

  const renderSecondDropdown = () => {
    if (selectedType === "api") {
      return (
        <Form.Group className="mb-3">
          <Form.Label>API Endpoint</Form.Label>
          <Form.Select
            value={selectedId}
            onChange={(e) => setSelectedId(+e.target.value)}
          >
            <option value="">-- Select API --</option>
            {apis.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      );
    }
    if (selectedType === "ftp") {
      return (
        <Form.Group className="mb-3">
          <Form.Label>FTP Endpoint</Form.Label>
          <Form.Select
            value={selectedId}
            onChange={(e) => setSelectedId(+e.target.value)}
          >
            <option value="">-- Select FTP --</option>
            {ftps.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      );
    }
    if (selectedType === "local") {
      return (
        <Form.Group className="mb-3">
          <Form.Label>Local Folder</Form.Label>
          <Form.Select
            value={selectedId}
            onChange={(e) => setSelectedId(+e.target.value)}
          >
            <option value="">-- Select Local Folder --</option>
            {locals.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      );
    }
    return null;
  };

  if (loading)
    return (
      <Container className="py-4 text-center">
        <Spinner />
      </Container>
    );

  return (
    <Container fluid="lg" className="py-4">
      <Button variant="secondary" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <Row className="my-4">
        <Col md={6} className="mx-auto p-4 bg-light rounded">
          <h4 className="text-center mb-3">Add Destination</h4>
          {errors && <Alert variant="danger">{errors}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select destination type</Form.Label>
              <Form.Select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as DestinationType);
                  setSelectedId("");
                }}
              >
                <option value="">-- Select Type --</option>
                <option value="api">API Endpoint</option>
                <option value="ftp">FTP Endpoint</option>
                <option value="local">Local Folder</option>
              </Form.Select>
            </Form.Group>
            {renderSecondDropdown()}
            <div className="text-center">
              <Button type="submit">Add Destination</Button>
            </div>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <h5>Existing Destinations</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Title</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d, idx) => {
                const type = d.external_api_endpoint_id
                  ? "API"
                  : d.external_ftp_endpoint_id
                  ? "FTP"
                  : "Local";
                const title =
                  type === "API"
                    ? apis.find((a) => a.id === d.external_api_endpoint_id)
                        ?.title
                    : type === "FTP"
                    ? ftps.find((f) => f.id === d.external_ftp_endpoint_id)
                        ?.title
                    : locals.find((l) => l.id === d.local_storage_folder_id)
                        ?.title;
                return (
                  <tr key={d.id}>
                    <td>{idx + 1}</td>
                    <td>{type}</td>
                    <td>{title}</td>
                    <td className="text-center">{d.is_active ? "✓" : "✗"}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        onClick={() => handleToggle(d)}
                        className="me-2"
                      >
                        {d.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(d.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default ProcessingRuleDestinationViewer;
