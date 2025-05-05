import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";

interface Destination {
  id: number;
  processing_rule_id: number;
  external_api_endpoint_id?: number;
  external_ftp_endpoint_id?: number;
  local_storage_folder_id?: number;
  is_active: boolean;
}

interface APIEndpoint { id: number; title: string; }
interface FTPEndpoint { id: number; title: string; }
interface LocalFolder { id: number; title: string; }

const BASE = "/api/processing-rules/destinations";

const ProcessingRuleDestinationViewer: React.FC = () => {
  const { id: ruleIdParam } = useParams<{ id: string }>();
  const ruleId = Number(ruleIdParam);
  const navigate = useNavigate();

  // 1) State za document_type_id
  const [ruleDocTypeId, setRuleDocTypeId] = useState<number | null>(null);
  const [ruleTitle, setRuleTitle] = useState<string>("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [apis, setApis] = useState<APIEndpoint[]>([]);
  const [ftps, setFtps] = useState<FTPEndpoint[]>([]);
  const [locals, setLocals] = useState<LocalFolder[]>([]);
  const [selectedApi, setSelectedApi] = useState<number | "">("");
  const [selectedFtp, setSelectedFtp] = useState<number | "">("");
  const [selectedLocal, setSelectedLocal] = useState<number | "">("");
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRule();
    fetchAll();
    fetchLookups();
  }, [ruleId]);

  // 2) Dohvati pravilo i iz njega uzmi document_type_id
  const fetchRule = async () => {
    try {
      const res = await fetch(`/api/processing-rules/${ruleId}`);
      if (res.ok) {
        const rule = await res.json();
        setRuleDocTypeId(rule.document_type_id);
        setRuleTitle(rule.title);
      }
    } catch (err) {
      console.error("Error fetching rule:", err);
      setErrors("Failed to load rule");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE);
      const all: Destination[] = await res.json();
      setDestinations(all.filter(d => d.processing_rule_id === ruleId));
    } catch (err) {
      console.error(err);
      setErrors("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [a, f, l] = await Promise.all([
        fetch("/api/api-endpoints").then(r => r.json()),
        fetch("/api/ftp-endpoints").then(r => r.json()),
        fetch("/api/local-storage-folder").then(r => r.json()),
      ]);
      setApis(a);
      setFtps(f);
      setLocals(l);
    } catch (err) {
      console.error(err);
      setApis([]);
      setFtps([]);
      setLocals([]);
    }
  };

  const resetForm = () => {
    setSelectedApi("");
    setSelectedFtp("");
    setSelectedLocal("");
    setErrors(null);
  };

  const validate = (): boolean => {
    const chosen = [selectedApi, selectedFtp, selectedLocal].filter(v => v !== "");
    if (chosen.length !== 1) {
      setErrors("Select exactly one destination type");
      return false;
    }
    if (ruleDocTypeId === null) {
      setErrors("Rule's document type not loaded");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    if (!validate()) return;

    // 3) Pošalji document_type_id onako kako backend očekuje
    const payload: any = {
      processing_rule_id: ruleId,  
      api_id: selectedApi || null,
      ftp_id: selectedFtp || null,
      local_folder_id: selectedLocal || null,
      is_active: true,
    };

    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Destination added");
      resetForm();
      fetchAll();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error creating destination:", err);
      setErrors("Failed to create destination");
    }
  };

  const handleToggle = async (d: Destination) => {
    try {
      await fetch(`${BASE}/${d.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type_id: ruleDocTypeId,
          api_id: d.external_api_endpoint_id || null,
          ftp_id: d.external_ftp_endpoint_id || null,
          local_folder_id: d.local_storage_folder_id || null,
          is_active: !d.is_active,
        }),
      });
      setDestinations(prev =>
        prev.map(x => x.id === d.id ? { ...x, is_active: !x.is_active } : x)
      );
    } catch {
      setErrors("Failed to toggle active");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this destination?")) return;
    try {
      await fetch(`${BASE}/${id}`, { method: "DELETE" });
      setDestinations(prev => prev.filter(x => x.id !== id));
    } catch {
      setErrors("Failed to delete");
    }
  };

  if (loading) {
    return <Container className="py-4 text-center"><Spinner /></Container>;
  }

  return (
    <Container fluid="lg" className="py-4">
      <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
      <h2 className="text-center my-4">
    Destinations for Rule: <strong>{ruleTitle}</strong>
  </h2>
      <Row className="my-4">
        <Col md={6} className="mx-auto p-4 bg-light rounded">
          {errors && <Alert variant="danger">{errors}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>API Endpoint</Form.Label>
              <Form.Select
                value={selectedApi}
                onChange={e => { resetForm(); setSelectedApi(+e.target.value); }}
              >
                <option value="">-- Select API --</option>
                {apis.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>FTP Endpoint</Form.Label>
              <Form.Select
                value={selectedFtp}
                onChange={e => { resetForm(); setSelectedFtp(+e.target.value); }}
              >
                <option value="">-- Select FTP --</option>
                {ftps.map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Local Folder</Form.Label>
              <Form.Select
                value={selectedLocal}
                onChange={e => { resetForm(); setSelectedLocal(+e.target.value); }}
              >
                <option value="">-- Select Local Folder --</option>
                {locals.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </Form.Select>
            </Form.Group>
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
                <th>#</th><th>Type</th><th>Title</th><th>Active</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d, i) => {
                const type = d.external_api_endpoint_id ? "API"
                  : d.external_ftp_endpoint_id ? "FTP" : "Local";
                const title = type === "API"
                  ? apis.find(a => a.id === d.external_api_endpoint_id)?.title
                  : type === "FTP"
                    ? ftps.find(f => f.id === d.external_ftp_endpoint_id)?.title
                    : locals.find(l => l.id === d.local_storage_folder_id)?.title;
                return (
                  <tr key={d.id}>
                    <td>{i+1}</td>
                    <td>{type}</td>
                    <td>{title}</td>
                    <td className="text-center">{d.is_active ? "✓" : "✗"}</td>
                    <td className="text-center">
                      <Button size="sm" onClick={() => handleToggle(d)} className="me-2">
                        {d.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(d.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {destinations.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center">No destinations</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default ProcessingRuleDestinationViewer;