import { useState, FormEvent } from "react";
import Stack from "react-bootstrap/Stack";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

function AddSSOProviderForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setResponseMessage("");

    const formData = new FormData(e.currentTarget);
    const newProvider = {
      name: formData.get("name"),
      client_id: formData.get("client_id"),
      client_secret: formData.get("client_secret"),
      callback_url: formData.get("callback_url"),
    };

    try {
      const response = await fetch("/sso-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProvider),
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage("✅ SSO Provider successfully added!");
        e.currentTarget.reset(); // Clear form
      } else {
        setResponseMessage(`❌ ${data.message || "Failed to add provider."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("❌ Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sso-form-container">
      <div className="sso-form-wrapper">
        <Stack
          gap={3}
          className="p-4 p-md-5 border rounded-4 bg-white shadow"
          style={{ width: "100%" }}
        >
          <h3 className="text-center fw-bold mb-3">Add New SSO Provider</h3>

          {responseMessage && (
            <div className="alert alert-info text-center">{responseMessage}</div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="ssoName">
              <Form.Label>Provider Name</Form.Label>
              <Form.Control type="text" name="name" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="ssoClientId">
              <Form.Label>Client ID</Form.Label>
              <Form.Control type="text" name="client_id" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="ssoClientSecret">
              <Form.Label>Client Secret</Form.Label>
              <Form.Control type="text" name="client_secret" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="ssoCallbackUrl">
              <Form.Label>Callback URL</Form.Label>
              <Form.Control type="url" name="callback_url" required />
            </Form.Group>

            <div className="d-grid mt-4">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Adding...
                  </>
                ) : (
                  "Add SSO Provider"
                )}
              </Button>
            </div>
          </Form>
        </Stack>
      </div>
    </div>
  );
}

export default AddSSOProviderForm;
