import { Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
function HomePage() {
  const navigate = useNavigate();

  return (
    <Container 
      className="d-flex align-items-center justify-content-center" 
      style={{ minHeight: "75vh" }}
    >
      <Row className="text-center">
        <Col>
          <h1 className="mb-4 display-4">Document Processing Admin Portal</h1>
          <p className="lead mb-5">Centralized management for document workflows</p>
          
          <div className="d-grid gap-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
            <Button 
              variant="primary" 
              size="lg" 
              className="p-3 fs-3 d-flex align-items-center justify-content-center gap-2"
              onClick={() => navigate("/document-types")}
            >
              <span>Document Types</span>
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              className="p-3 fs-3 d-flex align-items-center justify-content-center gap-2"
              onClick={() => navigate("/document-labels")}
            >
              <span>Document Labels</span>
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;