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
              <p className="mb-4" style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
              Our intelligent document processing solution simplifies the way users handle scanned documents and images. Through a Windows application, users can log in, select document types, and automatically detect files from local folders or cameras. Documents are securely submitted to a processing server, where OCR services (Tesseract, Google Vision, ChatGPT) extract and match data with predefined layouts.
              <br /><br />
              Users can review and correct the extracted data before final submission. Meanwhile, administrators use the web application to manage document types, define layout templates via a visual interface, and configure automated workflows—whether storing documents, uploading via FTP, or sending to APIs.
              <br /><br />
              The entire system is designed for security, accuracy, and efficiency, with support for OAuth, SSO, and dynamic integration rules—ensuring smooth, end-to-end document processing and delivery.
              </p>
            </div>


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