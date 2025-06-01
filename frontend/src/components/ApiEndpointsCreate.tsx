import React, { useState, useCallback, useEffect } from "react";
import { Container, Row, Col, Form, Button, Tabs, Tab, Modal } from "react-bootstrap";
import ParameterEditor, { ParameterLocation, QueryParameter } from "./ParameterEditor";
import { useNavigate, useParams } from "react-router-dom";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export enum ParameterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

interface ApiEndpoint {
  title: string;
  description?: string;
  base_url: string;
  route: string;
  method: HttpMethod;
  params: Record<
    string,
    {
      value: string;
      type: ParameterType;
      required: boolean;
    }
  >;
  headers: string;
  path_parameters?: Record<string, string>;
  timeout: number;
  is_active: boolean;
  created_by?: number | null;
}

const DEFAULT_ENDPOINT: ApiEndpoint = {
  title: "",
  description: "",
  base_url: "",
  route: "",
  method: HttpMethod.GET,
  params: {},
  headers: "",
  path_parameters: {},
  timeout: 30,
  is_active: false,
  created_by: null,
};

const ApiEndpointsCreate: React.FC = () => {
  const [formState, setFormState] = useState<ApiEndpoint>(DEFAULT_ENDPOINT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"basic" | "parameters">("basic");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number } | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  useEffect(() => {
    fetch("/auth/profile", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user profile");
        return res.json();
      })
      .then((data) => {
        setUser({ id: data.id }); // Assuming `data` includes `id`
      })
      .catch((err) => {
        console.error("Error fetching user profile:", err);
      });
  }, []);

  const updateFormState = useCallback((updates: Partial<ApiEndpoint>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  useEffect(() => {
  if (!isEditMode) return;

  const loadEndpoint = async () => {
    try {
      const res = await fetch(`/api/api-endpoints/${id}`);
      if (!res.ok) throw new Error("Failed to fetch endpoint");
      const data = await res.json();

      setFormState({
        title:            data.title,
        description:      data.description ?? "",
        base_url:         data.base_url,
        route:            data.route,
        method:           data.method as HttpMethod,
        params:           data.params
                            ? JSON.parse(data.params)
                            : {},
        headers:          data.headers && data.headers != "{}" ? data.headers : "",
        path_parameters:  data.path_parameters
                            ? JSON.parse(data.path_parameters)
                            : {},
        timeout:          data.timeout,
        is_active:        data.is_active,
        created_by:       data.created_by,
      });
    } catch (err) {
      console.error("Error loading endpoint:", err);
      setError("Could not load endpoint for editing.");
    }
  };

  loadEndpoint();
}, [id, isEditMode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formState.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formState.base_url.trim()) {
      newErrors.base_url = "Base URL is required";
    } else if (!formState.base_url.startsWith("http://") && !formState.base_url.startsWith("https://")) {
      newErrors.base_url = "Base URL must start with http:// or https://";
    }

    if (!formState.route.trim()) {
      newErrors.route = "Route is required";
    }

    if (!formState.method) {
      newErrors.method = "HTTP Method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      // Prepare the payload
      const payload: any = {
      title:            formState.title,
      description:      formState.description,
      base_url:         formState.base_url,
      route:            formState.route,
      method:           formState.method,
      params:
        formState.params && Object.keys(formState.params).length != 0 ? 
        (typeof formState.params === "string"
          ? formState.params
          : JSON.stringify(formState.params))
        : "{}",
      headers:          formState.headers || "{}",
      path_parameters:
        typeof formState.path_parameters === "string"
          ? formState.path_parameters
          : JSON.stringify(formState.path_parameters),
      timeout:  formState.timeout,
      is_active:        formState.is_active,
    };


    if (!isEditMode) {
      payload.created_by = user!.id;       // assume user is non-null here
    }

      const response = await fetch(
        isEditMode ? `/api/api-endpoints/${id}` : "/api/api-endpoints",
      {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

      if (!response.ok) {
        // Get the error message from the response if available
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log('API Endpoint created successfully:', data);
      
      setHasChanges(false);
      navigate('/api-endpoints');
    } catch (error) {
      console.error('Error payload:', formState); // Debug log
      console.error('Error saving API endpoint:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigate('/api-endpoints');
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    navigate('/api-endpoints');
  };

  const handleCancelDismiss = () => {
    setShowCancelModal(false);
  };

  return (
    <Container fluid="md" className="py-4">
      <Row>
        <Col md={8} className="mx-auto">
          <h2 className="text-center mb-4">
            {isEditMode ? "Edit API Endpoint" : "Create API Endpoint"}
          </h2>
          <Form>
            <Tabs
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab as "basic" | "parameters")}
              className="mb-3"
            >
              {/* Basic Info Tab */}
              <Tab eventKey="basic" title="Basic Info">
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formState.title}
                    onChange={(e) => updateFormState({ title: e.target.value })}
                    isInvalid={!!errors.title}
                    placeholder="e.g., Document Processing API"
                  />
                  <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formState.description}
                    onChange={(e) => updateFormState({ description: e.target.value })}
                    placeholder="What this endpoint is used for"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="base_url">
                      <Form.Label>Base URL</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.base_url}
                        onChange={(e) => updateFormState({ base_url: e.target.value })}
                        isInvalid={!!errors.base_url}
                        placeholder="https://api.example.com"
                      />
                      <Form.Control.Feedback type="invalid">{errors.base_url}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="route">
                      <Form.Label>Route</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.route}
                        onChange={(e) => updateFormState({ route: e.target.value })}
                        isInvalid={!!errors.route}
                        placeholder="/endpoint"
                      />
                      <Form.Control.Feedback type="invalid">{errors.route}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="method">
                      <Form.Label>HTTP Method</Form.Label>
                      <Form.Select
                        value={formState.method}
                        onChange={(e) => updateFormState({ method: e.target.value as HttpMethod })}
                      >
                        {Object.values(HttpMethod).map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="timeout">
                      <Form.Label>Timeout</Form.Label>
                      <Form.Control
                        type="number"
                        value={formState.timeout}
                        onChange={(e) =>
                          updateFormState({ timeout: parseInt(e.target.value, 10) || 0 })
                        }
                        placeholder="30"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="is_active">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={formState.is_active}
                    onChange={(e) => updateFormState({ is_active: e.target.checked })}
                  />
                </Form.Group>
              </Tab>

              {/* Parameters Tab */}
              <Tab eventKey="parameters" title="Parameters">
                {/* Query Parameters */}
                <ParameterEditor
                  location={ParameterLocation.QUERY}
                  value={formState.params as Record<string, QueryParameter>}
                  onChange={(value) => updateFormState({ 
                    params: value as Record<string, QueryParameter>
                  })}
                />

                {/* Headers */}
                <ParameterEditor
                  location={ParameterLocation.HEADER}
                  value={formState.headers || ""}
                  onChange={(value) => updateFormState({ 
                    headers: value as string
                  })}
                />
              </Tab>
            </Tabs>

            <div className="d-flex justify-content-between">
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline-secondary" onClick={handleCancelClick}>
                Cancel
              </Button>
            </div>
            {saveError && <div className="text-danger mt-3">{saveError}</div>}
          </Form>
        </Col>
      </Row>

      <Modal show={showCancelModal} onHide={handleCancelDismiss}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel? All unsaved changes will be lost.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDismiss}>
            No, Continue Editing
          </Button>
          <Button variant="danger" onClick={handleCancelConfirm}>
            Yes, Cancel Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ApiEndpointsCreate;


