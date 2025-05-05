import React, { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Table, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface ProcessingRule {
  id: number;
  title: string;
  description: string;
  document_type_id: number;
  is_active: boolean;
}
interface DocumentType {
  id: number;
  name: string;
}

export const ProcessingRuleViewer: React.FC = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<ProcessingRule[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [docTypeId, setDocTypeId] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ title?: string; docTypeId?: string }>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRules();
    fetchDocTypes();
  }, []);

  const fetchRules = async () => {
    const res = await fetch('/api/processing-rules');
    setRules(await res.json());
  };
  const fetchDocTypes = async () => {
    const res = await fetch('/api/document-types');
    setDocTypes(await res.json());
  };

  const validate = () => {
    const errs: any = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!docTypeId) errs.docTypeId = "Document type is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDocTypeId('');
    setIsActive(true);
    setEditingId(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { title, description, document_type_id: docTypeId, is_active: isActive };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `/api/processing-rules/${editingId}/update`
      : '/api/processing-rules';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
        console.error('Request failed');
        return;
      }
    
      if (editingId !== null) {
        // Update the existing rule in state without refetching all
        setRules(prev => prev.map(r =>
            r.id === editingId
              ? {
                  ...r,
                  title,
                  description,
                  document_type_id: docTypeId as number,
                  is_active: isActive,
                }
              : r
          )
        );
        setSuccessMsg('Updated successfully!');
      } else {
        // New rule: fetch the full list to include the new one
        await fetchRules();
        setSuccessMsg('Rule created!');
      }
    
      resetForm();
      setTimeout(() => setSuccessMsg(null), 3000);
    };

  const handleEdit = (rule: ProcessingRule) => {
    setEditingId(rule.id);
    setTitle(rule.title);
    setDescription(rule.description);
    setDocTypeId(rule.document_type_id);
    setIsActive(rule.is_active);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this rule?')) return;
    await fetch(`/api/processing-rules/${id}`, { method: 'DELETE' });
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const toggleActive = async (rule: ProcessingRule) => {
    await fetch(`/api/processing-rules/${rule.id}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !rule.is_active }),
    });
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
  };

  return (
    <Container fluid="lg" className="py-4">
      <Row className="mb-4">
        <Col md={6} className="mx-auto p-4 bg-light rounded">
          <h4 className="text-center mb-3">
            {editingId ? 'Edit Rule' : 'Create Rule'}
          </h4>
          {successMsg && (
            <Alert variant="success" className="text-center">
              {successMsg}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={title}
                onChange={e => setTitle(e.target.value)}
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <Form.Select
                value={docTypeId}
                onChange={e => setDocTypeId(+e.target.value)}
                isInvalid={!!errors.docTypeId}
              >
                <option value="">-- Select Document Type --</option>
                {docTypes.map(dt => (
                  <option key={dt.id} value={dt.id}>
                    {dt.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.docTypeId}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="isActive">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
            </Form.Group>
            <div className="text-center">
              <Button type="submit" className="me-2">
                {editingId ? 'Update' : 'Add Rule'}
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
      <Row>
        <Col>
          <Table striped bordered hover responsive style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '25%' }}>Title</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '10%' }}>Active</th>
                <th style={{ width: '25%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, idx) => (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {r.title}
                  </td>
                  <td
                    style={{
                      maxHeight: '4rem',
                      overflowY: 'auto',
                      wordBreak: 'break-word',
                    }}
                  >
                    {r.description}
                  </td>
                  <td className="text-center">{r.is_active ? '✓' : '✗'}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <Button size="sm" onClick={() => handleEdit(r)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => toggleActive(r)}
                      >
                        {r.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => navigate(`/processing-rules/destinations/${r.id}`)}
                      >
                        Destinations
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default ProcessingRuleViewer;