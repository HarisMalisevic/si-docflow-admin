import React, { useState, useCallback } from 'react';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';

export enum ParameterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export enum ParameterLocation {
  QUERY = "query",
  HEADER = "header",
  BODY = "body",
}

export interface QueryParameter {
  name: string;
  value: string;
  type: ParameterType;
  required: boolean;
}

interface ParameterEditorProps {
  location: ParameterLocation;
  value: string | Record<string, QueryParameter>;
  onChange: (value: string | Record<string, QueryParameter>) => void;
}

export const ParameterEditor: React.FC<ParameterEditorProps> = ({ location, value, onChange }) => {
  // For HEADER and BODY
  const [textValue, setTextValue] = useState(
    typeof value === 'string' ? value : ''
  );

  // For QUERY parameters
  const [parameters, setParameters] = useState<Record<string, QueryParameter>>(
    typeof value === 'object' ? value : {}
  );

  const handleTextChange = useCallback((newValue: string) => {
    setTextValue(newValue);
    onChange(newValue);
  }, [onChange]);

  const addQueryParameter = useCallback(() => {
    const newParam: QueryParameter = {
      name: '',
      value: '',
      type: ParameterType.STRING,
      required: false
    };
    
    const paramKey = `param-${Object.keys(parameters).length}`;
    setParameters(prev => ({
      ...prev,
      [paramKey]: newParam
    }));
  }, [parameters]);

  const updateQueryParameter = useCallback((key: string, updates: Partial<QueryParameter>) => {
    setParameters(prev => {
      const updated = {
        ...prev,
        [key]: { ...prev[key], ...updates }
      };
      onChange(updated);
      return updated;
    });
  }, [onChange]);

  const removeQueryParameter = useCallback((key: string) => {
    setParameters(prev => {
      const updated = { ...prev };
      delete updated[key];
      onChange(updated);
      return updated;
    });
  }, [onChange]);

  if (location === ParameterLocation.HEADER || location === ParameterLocation.BODY) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4>{location.charAt(0).toUpperCase() + location.slice(1)} Parameters</h4>
        <Form.Group>
          <Form.Control
            as="textarea"
            rows={6}
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={`Enter ${location} content here...`}
          />
        </Form.Group>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Query Parameters</h4>
        <Button variant="primary" size="sm" onClick={addQueryParameter}>
          Add Parameter
        </Button>
      </div>
      {Object.entries(parameters).map(([key, param]) => (
        <Card key={key} className="mb-3">
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={param.name}
                    onChange={(e) => updateQueryParameter(key, { name: e.target.value })}
                    placeholder="Parameter name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Value</Form.Label>
                  <Form.Control
                    type="text"
                    value={param.value}
                    onChange={(e) => updateQueryParameter(key, { value: e.target.value })}
                    placeholder="Parameter value"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={param.type}
                    onChange={(e) => updateQueryParameter(key, { type: e.target.value as ParameterType })}
                  >
                    {Object.values(ParameterType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  label="Required"
                  checked={param.required}
                  onChange={(e) => updateQueryParameter(key, { required: e.target.checked })}
                />
              </Col>
              <Col md={6} className="text-end">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeQueryParameter(key)}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default ParameterEditor;