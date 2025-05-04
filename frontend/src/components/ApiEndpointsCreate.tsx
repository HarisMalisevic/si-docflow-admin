import React, { useState, useCallback } from "react";
import { Container, Row, Col, Form, Button, Tabs, Tab, Modal } from "react-bootstrap";
import ParameterEditor, { ParameterLocation, QueryParameter } from "./ParameterEditor";
import { useNavigate } from "react-router-dom";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export enum AuthType {
  NONE = "None",
  API_KEY = "API_Key",
  BASIC = "Basic",
  BEARER = "Bearer",
  OAUTH = "OAuth",
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
  query_parameters: Record<
    string,
    {
      value: string;
      type: ParameterType;
      required: boolean;
      description: string;
    }
  >;
  headers: string;
  body: string;
  path_parameters?: Record<string, string>;
  timeout_seconds: number;
  auth_type: AuthType;
  auth_credentials?: {
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyLocation?: string;
    username?: string;
    password?: string;
    token?: string;
    clientId?: string;
    clientSecret?: string;
    tokenUrl?: string;
    scopes?: string[];
  };
  is_active: boolean;
  created_by: number;
}

const DEFAULT_ENDPOINT: ApiEndpoint = {
  title: "",
  description: "",
  base_url: "",
  route: "",
  method: HttpMethod.GET,
  query_parameters: {},
  headers: "",
  body: "",
  path_parameters: {},
  timeout_seconds: 30,
  auth_type: AuthType.NONE,
  auth_credentials: {},
  is_active: false,
  created_by: 1, // Replace with the actual user ID
};

const ApiEndpointsCreate: React.FC = () => {
  const [formState, setFormState] = useState<ApiEndpoint>(DEFAULT_ENDPOINT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"basic" | "parameters" | "auth">("basic");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  const updateFormState = useCallback((updates: Partial<ApiEndpoint>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Prepare the payload
    const payload = {
      ...formState,
      // Query parameters should be a JSON string containing the full object
      query_parameters: JSON.stringify(formState.query_parameters),
      // Headers and body should just be the raw string content
      headers: formState.headers,
      body: formState.body,
      // Auth credentials should be a JSON string
      auth_credentials: JSON.stringify(formState.auth_credentials || {}),
    };

    console.log("Payload to be sent to the database:", payload);
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
          <h2 className="text-center mb-4">Create API Endpoint</h2>
          <Form>
            <Tabs
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab as "basic" | "parameters" | "auth")}
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
                    <Form.Group className="mb-3" controlId="timeout_seconds">
                      <Form.Label>Timeout (seconds)</Form.Label>
                      <Form.Control
                        type="number"
                        value={formState.timeout_seconds}
                        onChange={(e) =>
                          updateFormState({ timeout_seconds: parseInt(e.target.value, 10) || 0 })
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
                  value={formState.query_parameters as Record<string, QueryParameter>}
                  onChange={(value) => updateFormState({ 
                    query_parameters: value as Record<string, QueryParameter>
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

                {/* Body */}
                <ParameterEditor
                  location={ParameterLocation.BODY}
                  value={formState.body || ""}
                  onChange={(value) => updateFormState({ 
                    body: value as string
                  })}
                />
              </Tab>

              {/* Authentication Tab */}
              <Tab eventKey="auth" title="Authentication">
                <Form.Group className="mb-3" controlId="auth_type">
                  <Form.Label>Authentication Type</Form.Label>
                  <Form.Select
                    value={formState.auth_type}
                    onChange={(e) => updateFormState({ auth_type: e.target.value as AuthType })}
                  >
                    {Object.values(AuthType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Render fields based on auth type */}
                {formState.auth_type === AuthType.API_KEY && (
                  <div>
                    <Form.Group className="mb-3" controlId="apiKeyName">
                      <Form.Label>API Key Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.auth_credentials?.apiKeyName || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              apiKeyName: e.target.value,
                            },
                          })
                        }
                        placeholder="X-API-Key"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="apiKeyValue">
                      <Form.Label>API Key Value</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.auth_credentials?.apiKeyValue || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              apiKeyValue: e.target.value,
                            },
                          })
                        }
                        placeholder="your_api_key_here"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="apiKeyLocation">
                      <Form.Label>API Key Location</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.auth_credentials?.apiKeyLocation || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              apiKeyLocation: e.target.value,
                            },
                          })
                        }
                        placeholder="header or query"
                      />
                    </Form.Group>
                  </div>
                )}

                {formState.auth_type === AuthType.BASIC && (
                  <div>
                    <Form.Group className="mb-3" controlId="username">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.auth_credentials?.username || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              username: e.target.value,
                            },
                          })
                        }
                        placeholder="your_username"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={formState.auth_credentials?.password || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              password: e.target.value,
                            },
                          })
                        }
                        placeholder="your_password"
                      />
                    </Form.Group>
                  </div>
                )}

                {formState.auth_type === AuthType.BEARER && (
                  <div>
                    <Form.Group className="mb-3" controlId="token">
                      <Form.Label>Bearer Token</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.auth_credentials?.token || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              token: e.target.value,
                            },
                          })
                        }
                        placeholder="your_bearer_token"
                      />
                    </Form.Group>
                  </div>
                )}

                {formState.auth_type === AuthType.OAUTH && (
                  <div>
                    <Form.Group className="mb-3" controlId="clientId">
                      <Form.Label>Client ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.auth_credentials?.clientId || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              clientId: e.target.value,
                            },
                          })
                        }
                        placeholder="your_client_id"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="clientSecret">
                      <Form.Label>Client Secret</Form.Label>
                      <Form.Control
                        type="password"
                        value={formState.auth_credentials?.clientSecret || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              clientSecret: e.target.value,
                            },
                          })
                        }
                        placeholder="your_client_secret"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="tokenUrl">
                      <Form.Label>Token URL</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.auth_credentials?.tokenUrl || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              tokenUrl: e.target.value,
                            },
                          })
                        }
                        placeholder="https://example.com/oauth/token"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="scopes">
                      <Form.Label>Scopes</Form.Label>
                      <Form.Control
                        type="text"
                        value={formState.auth_credentials?.scopes?.join(", ") || ""}
                        onChange={(e) =>
                          updateFormState({
                            auth_credentials: {
                              ...formState.auth_credentials,
                              scopes: e.target.value.split(",").map((scope) => scope.trim()),
                            },
                          })
                        }
                        placeholder="scope1, scope2"
                      />
                    </Form.Group>
                  </div>
                )}
              </Tab>
            </Tabs>

            <div className="d-flex justify-content-between">
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline-secondary" onClick={handleCancelClick}>
                Cancel
              </Button>
            </div>
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


