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
          <h1 className="text-center fw-bold mb-4">Welcome to your DocFlow Admin Dashboard!</h1>
          <h3 className="fw-light mb-4">Here you can manage: </h3>
          
          <Row className="justify-content-center g-4">
            <Col className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-50 d-flex align-items-center justify-content-center border"
                onClick={() => navigate("/document-types")}
              >
                <span>Document Types</span>
              </Button>
            </Col>
            <Col className="d-flex justify-content-start">
              <Button
                variant="secondary"
                size="lg"
                className="w-50 d-flex align-items-center justify-content-center border"
                onClick={() => navigate("/document-layouts")}
              >
                <span>Document Layouts</span>
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;