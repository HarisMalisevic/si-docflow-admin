import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Spinner,
  Alert,
  Pagination,
  InputGroup,
  Button,
} from "react-bootstrap";

interface AIProviderAttributes {
  id: number;
  name: string;
}

interface DocumentType {
  id: number;
  name: string;
}

interface ProcessingRequestsBillingLogAttributes {
  id: number;
  document_type_id: number;
  ai_provider_id: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

const ITEMS_PER_PAGE = 10;

const BillingLogsViewer: React.FC = () => {
  const [billingLogs, setBillingLogs] = useState<
    ProcessingRequestsBillingLogAttributes[]
  >([]);
  const [aiProviders, setAiProviders] = useState<AIProviderAttributes[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  const [selectedAiProviderId, setSelectedAiProviderId] = useState<string>("");
  const [minPriceFilter, setMinPriceFilter] = useState<string>("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsRes, providersRes, docTypesRes] = await Promise.all([
        fetch("/api/processing-requests-billing-logs"),
        fetch("/api/ai-providers"),
        fetch("/api/document-types"),
      ]);

      const processResponse = async (res: Response, name: string) => {
        const responseText = await res.text();
        if (!res.ok) {
          console.error(
            `${name} API Error Response (Status ${res.status}):`,
            responseText
          );
          throw new Error(
            `Failed to fetch ${name.toLowerCase()}: ${res.status} ${
              res.statusText
            }`
          );
        }
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error(`${name} JSON Parse Error. Raw text:`, responseText);
          throw new Error(
            `Failed to parse ${name.toLowerCase()} data: Invalid JSON format.`
          );
        }
      };

      const billingLogsData = await processResponse(logsRes, "Billing Logs");
      const aiProvidersData = await processResponse(
        providersRes,
        "AI Providers"
      );
      const documentTypesData = await processResponse(
        docTypesRes,
        "Document Types"
      );

      setBillingLogs(billingLogsData);
      setAiProviders(aiProvidersData);
      setDocumentTypes(documentTypesData);
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchInitialData();
  };

  const filteredBillingLogs = billingLogs.filter((log) => {
    const matchesAiProvider =
      !selectedAiProviderId ||
      log.ai_provider_id === parseInt(selectedAiProviderId, 10);

    let matchesMinPrice = true;
    if (minPriceFilter) {
      const minPrice = parseFloat(minPriceFilter);
      if (!isNaN(minPrice)) {
        matchesMinPrice = log.price >= minPrice;
      }
    }

    let matchesMaxPrice = true;
    if (maxPriceFilter) {
      const maxPrice = parseFloat(maxPriceFilter);
      if (!isNaN(maxPrice)) {
        matchesMaxPrice = log.price <= maxPrice;
      }
    }

    return matchesAiProvider && matchesMinPrice && matchesMaxPrice;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const indexOfLastLog = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstLog = indexOfLastLog - ITEMS_PER_PAGE;
  const currentLogs = filteredBillingLogs.slice(
    indexOfFirstLog,
    indexOfLastLog
  );
  const totalPages = Math.ceil(filteredBillingLogs.length / ITEMS_PER_PAGE);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination className="justify-content-center mt-3">{items}</Pagination>
    );
  };

  return (
    <Container fluid="lg" className="py-4">
      <Row>
        <Col className="text-center mb-4">
          <h1>Processing Requests & Billing Logs</h1>
        </Col>
      </Row>

      <Row className="mb-3 align-items-end">
        <Col md={3} xs={12} className="mb-2 mb-md-0">
          <Form.Group controlId="aiProviderFilter">
            <Form.Label>Filter by AI Provider</Form.Label>
            <Form.Select
              value={selectedAiProviderId}
              onChange={(e) => {
                setSelectedAiProviderId(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by AI Provider"
            >
              <option value="">All AI Providers</option>
              {aiProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3} xs={12} className="mb-2 mb-md-0">
          <Form.Group controlId="minPriceFilter">
            <Form.Label>Min Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Min"
                value={minPriceFilter}
                onChange={(e) => {
                  setMinPriceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by Minimum Price"
                step="0.01"
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={3} xs={12} className="mb-2 mb-md-0">
          <Form.Group controlId="maxPriceFilter">
            <Form.Label>Max Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Max"
                value={maxPriceFilter}
                onChange={(e) => {
                  setMaxPriceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by Maximum Price"
                step="0.01"
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={2} xs={12}>
          {/* empty column for better visual distribution of elements */}
        </Col>
        <Col
          md={1}
          xs={2}
          className="d-flex align-items-end justify-content-md-end justify-content-center"
        >
          <Button
            variant="success"
            onClick={handleRefresh}
            disabled={loading}
            className="w-100 w-md-auto"
            style={{ minWidth: "100px" }}
          >
            {loading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Refresh"
            )}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {loading && billingLogs.length === 0 ? (
            <div className="text-center py-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading Billing Logs...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          ) : (
            <>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Document Type</th>
                    <th>AI Provider</th>
                    <th>Price</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.length > 0 ? (
                    currentLogs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{indexOfFirstLog + index + 1}</td>
                        <td>
                          {documentTypes.find(
                            (dt) => dt.id === log.document_type_id
                          )?.name || `ID: ${log.document_type_id}`}
                        </td>
                        <td>
                          {aiProviders.find(
                            (ap) => ap.id === log.ai_provider_id
                          )?.name || `ID: ${log.ai_provider_id}`}
                        </td>
                        <td>${log.price.toFixed(2)}</td>
                        <td>{formatDate(log.createdAt || log.updatedAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-3">
                        No billing logs found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {renderPagination()}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BillingLogsViewer;
