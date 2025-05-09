import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface FTPEndpoint {
  title?: string;
  description?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  path: string;
  created_by: number;
}

const DEFAULT_FTP_ENDPOINT: FTPEndpoint = {
  title: "",
  description: "",
  host: "",
  port: 0,
  username: "",
  password: "",
  secure: false,
  path: "",
  created_by: 0,
};

const FTPEndpointsCreate: React.FC = () => {
  const [formState, setFormState] = useState<FTPEndpoint>(DEFAULT_FTP_ENDPOINT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [user, setUser] = useState<{ id: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/auth/profile", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user profile");
        return res.json();
      })
      .then((data) => {
        setUser({ id: data.id });
        setFormState((prev) => ({ ...prev, created_by: data.id }));
      })
      .catch((err) => {
        console.error("Error loading user:", err);
      });
  }, []);

  const updateFormState = (updates: Partial<FTPEndpoint>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formState.host.trim()) newErrors.host = "Host is required";
    if (!formState.port) newErrors.port = "Port is required";
    if (!formState.path.trim()) newErrors.path = "Path is required";
    if (!formState.username.trim()) newErrors.username = "Username is required";
    if (!formState.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = { ...formState };

      const response = await fetch("/api/ftp-endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save FTP endpoint");
      }

      navigate("/ftp-endpoints");
    } catch (error: any) {
      setSaveError(error.message || "Error saving FTP endpoint.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigate("/ftp-endpoints");
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    navigate("/ftp-endpoints");
  };

  return (
    <Container className="py-4">
      <Row>
        <Col md={8} className="mx-auto">
          <h2 className="text-center mb-4">Create FTP Endpoint</h2>
          <Form>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={formState.title}
                onChange={(e) => updateFormState({ title: e.target.value })}
                placeholder="Optional name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formState.description}
                onChange={(e) => updateFormState({ description: e.target.value })}
                placeholder="Short description"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="host">
              <Form.Label>Host</Form.Label>
              <Form.Control
                type="text"
                value={formState.host}
                onChange={(e) => updateFormState({ host: e.target.value })}
                isInvalid={!!errors.host}
                placeholder="ftp.example.com"
              />
              <Form.Control.Feedback type="invalid">{errors.host}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="port">
              <Form.Label>Port</Form.Label>
              <Form.Control
                type="number"
                value={formState.port}
                onChange={(e) => updateFormState({ port: parseInt(e.target.value, 10) || 0 })}
                isInvalid={!!errors.port}
              />
              <Form.Control.Feedback type="invalid">{errors.port}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={formState.username}
                onChange={(e) => updateFormState({ username: e.target.value })}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={formState.password}
                onChange={(e) => updateFormState({ password: e.target.value })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="path">
              <Form.Label>Path</Form.Label>
              <Form.Control
                type="text"
                value={formState.path}
                onChange={(e) => updateFormState({ path: e.target.value })}
                isInvalid={!!errors.path}
                placeholder="/uploads"
              />
              <Form.Control.Feedback type="invalid">{errors.path}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="secure">
              <Form.Check
                type="checkbox"
                label="Use Secure FTP (FTPS)"
                checked={formState.secure}
                onChange={(e) => updateFormState({ secure: e.target.checked })}
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline-secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>

            {saveError && <div className="text-danger mt-3">{saveError}</div>}
          </Form>
        </Col>
      </Row>

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Discard Changes?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to cancel? Unsaved changes will be lost.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Continue Editing
          </Button>
          <Button variant="danger" onClick={handleCancelConfirm}>
            Discard Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FTPEndpointsCreate;
