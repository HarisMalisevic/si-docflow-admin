import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Table, Alert, InputGroup, FormControl, Badge } from "react-bootstrap";

interface AccessToken {
  id: number;
  token: string;
  name: string;
  description: string;
  is_active: boolean;
}

const AccessRightsViewer: React.FC = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [token, setToken] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [tokens, setTokens] = useState<AccessToken[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [errors, setErrors] = useState<{ name?: string; description?: string; token?: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/access-rights");
      const data = await res.json();
      setTokens(data);
    } catch (err) {
      console.error(err);
    }
  };

  const validate = (): boolean => {
    const errs: any = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!token.trim() && !editingId) errs.token = "Please generate a token first.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerateToken = () => {
    if (editingId) return;
    const newToken =
      window.crypto?.randomUUID?.() ||
      Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    setToken(newToken);
    setErrors((prev) => ({ ...prev, token: undefined }));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setToken("");
    setIsActive(true);
    setEditingId(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { name, description, token, is_active: isActive };
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/access-rights/${editingId}`
        : "/api/access-rights";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        if (editingId) {
            setTokens(prev => prev.map(t =>
              t.id === editingId ? { ...t, name, description, token, is_active: isActive } : t
            ));
          } else {
            fetchTokens();
          }
        setSuccessMsg(editingId ? "Updated successfully!" : "Token created!");
        resetForm();
        window.setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        console.error("Request failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (tok: AccessToken) => {
    setErrors({});
    setEditingId(tok.id);
    setName(tok.name);
    setDescription(tok.description);
    setToken(tok.token);
    setIsActive(tok.is_active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this token?")) return;
    try {
      const res = await fetch(`/api/access-rights/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchTokens();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (tok: AccessToken) => {
    try {
      const res = await fetch(`/api/access-rights/${tok.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !tok.is_active }),
      });
      if (res.ok) setTokens((prev) => prev.map((t) => t.id === tok.id ? { ...t, is_active: !t.is_active } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReveal = (id: number) => {
    const newSet = new Set(revealedIds);
    if (revealedIds.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRevealedIds(newSet);
  };

  const filtered = tokens.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container fluid="xl" className="py-4">
      <Row className="mb-4">
        <Col md={6} className="mx-auto p-4 bg-light rounded">
          <h4 className="text-center mb-3">
            {editingId ? "Edit Token" : "Create Access Token"}
          </h4>
          {successMsg && <Alert variant="success" className="text-center">{successMsg}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Token</Form.Label>
              <InputGroup>
                <FormControl
                  type="text"
                  value={token}
                  readOnly
                  isInvalid={!!errors.token}
                />
                {!editingId && (
                  <Button variant="outline-secondary" onClick={handleGenerateToken}>
                    Generate
                  </Button>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.token}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <div className="text-center">
              <Button variant="success" type="submit" className="me-2">
                {editingId ? "Update" : "Add Token"}
              </Button>
              {editingId && (
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col Col xs={10} md={10} className="mx-auto p-4 bg-light rounded">
          <Form className="d-flex mb-3 w-50">
            <Form.Control
              type="text"
              placeholder="Search tokens"
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form>

          <div className="table-responsive px-3">
            <Table striped bordered hover style={{ width: '100%', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th style={{ width: '4%' }}>#</th>
                  <th style={{ width: '13%' }}>Name</th>
                  <th style={{ width: '22%' }}>Description</th>
                  <th style={{ width: '36%' }}>Token</th>
                  <th className="text-center" style={{ width: '10%' }}>Active</th>
                  <th className="text-center" style={{ width: '15%' }}>Actions</th>
                </tr>
              </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((t, idx) => (
                    <tr key={t.id}>
                      <td>{idx + 1}</td>
                      <td title={t.name} style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {t.name}
                      </td>
                      <td>
                        <div
                          title={t.description}
                          style={{ maxHeight: '4rem', overflowY: 'auto', wordBreak: 'break-word' }}
                        >
                          {t.description}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis',wordBreak: 'break-word' }}>
                        {revealedIds.has(t.id) ? t.token : '•••••••••••••••'}
                        <Button variant="link" size="sm" onClick={() => toggleReveal(t.id)}>
                          {revealedIds.has(t.id) ? 'Hide' : 'Show'}
                        </Button>
                      </td>
                      <td className="text-center align-middle">
                      <Badge
                        bg={t.is_active ? "success" : "secondary"}
                        pill
                      >
                        {t.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button variant="outline-primary" size="sm" onClick={() => handleEdit(t)}>
                            Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t.id)}>
                            Delete
                          </Button>
                          <Button variant="outline-secondary" size="sm" onClick={() => toggleActive(t)}>
                            {t.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    No tokens available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
            </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AccessRightsViewer;