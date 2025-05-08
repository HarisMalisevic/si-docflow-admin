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

            <div className="mb-4 mx-auto text-center text-muted" style={{ maxWidth: "800px" }}>
              <p className="mb-4" style={{ fontSize: "1.1rem", lineHeight: "1.5" }}>
              Our intelligent document processing solution simplifies the way users handle scanned documents and images. Through the web application, administrators are able to manage document types, define layout templates via a visual interface, and configure automated workflows.
              <br /><br />
              The entire system is designed for security, accuracy, and efficiency, with support for OAuth, SSO, and dynamic integration rules—ensuring smooth, end-to-end document processing and delivery.
              </p>
            </div>

          <h3 className="fw-light mb-4">What do you wish to manage today?</h3>

        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;