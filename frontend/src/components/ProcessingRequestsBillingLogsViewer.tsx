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
  file_name: string;
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
  const [priceFilter, setPriceFilter] = useState<string>("");

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

      if (!logsRes.ok) {
        const errorText = await logsRes.text();
        throw new Error(
          `Failed to fetch billing logs: ${logsRes.status} ${errorText}`
        );
      }
      if (!providersRes.ok) {
        const errorText = await providersRes.text();
        throw new Error(
          `Failed to fetch AI providers: ${providersRes.status} ${errorText}`
        );
      }
      if (!docTypesRes.ok) {
        const errorText = await docTypesRes.text();
        throw new Error(
          `Failed to fetch document types: ${docTypesRes.status} ${errorText}`
        );
      }

      setBillingLogs(await logsRes.json());
      setAiProviders(await providersRes.json());
      setDocumentTypes(await docTypesRes.json());
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
      log.ai_provider_id === parseInt(selectedAiProviderId);

    const matchesPrice =
      !priceFilter ||
      log.price.toString().includes(priceFilter) ||
      log.price === parseFloat(priceFilter);

    return matchesAiProvider && matchesPrice;
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
          <h1>Processing Requests Billing Logs</h1>
        </Col>
      </Row>

      <Row className="mb-3 align-items-end">
        <Col md={4} xs={12} className="mb-2 mb-md-0">
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
                  {provider.name} (ID: {provider.id})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} xs={12} className="mb-2 mb-md-0">
          <Form.Group controlId="priceFilter">
            <Form.Label>Filter by Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Enter price"
                value={priceFilter}
                onChange={(e) => {
                  setPriceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by Price"
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col
          md={4}
          xs={12}
          className="d-flex align-items-end justify-content-md-end justify-content-center"
        >
          <Button variant="success" onClick={handleRefresh} disabled={loading}>
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
                    <th>File Name</th>
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
                        <td>{log.file_name}</td>
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
                      <td colSpan={6} className="text-center py-3">
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
