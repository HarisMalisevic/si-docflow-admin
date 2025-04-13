import { useState, useRef, FormEvent } from "react";
import Stack from "react-bootstrap/Stack";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

function SSOProviderCreate() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setResponseMessage("");

    const formData = new FormData(formRef.current!);
    const newProvider = {
      display_name: formData.get("display_name"),
      api_name: formData.get("api_name"),
      client_id: formData.get("client_id"),
      client_secret: formData.get("client_secret"),
      callback_url: formData.get("callback_url"),
      authorization_url: formData.get("authorization_url"),
      token_url: formData.get("token_url"),
    };

    try {
      const response = await fetch("/api/sso-providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProvider),
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage("✅ SSO Provider successfully added!");
        formRef.current?.reset();
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
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <Stack gap={3} className="p-4 p-md-5 border rounded-4 bg-white shadow">
          <h2 className="text-center fw-bold mb-3">Add SSO Provider</h2>

          {responseMessage && (
            <div className="alert alert-info text-center">{responseMessage}</div>
          )}

          <Form onSubmit={handleSubmit} ref={formRef}>
            <Form.Group className="mb-3" controlId="ssoDisplayName">
              <Form.Label>Provider Display Name</Form.Label>
              <Form.Control
                type="text"
                name="display_name"
                placeholder="Google, GitHub..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="ssoApiName">
              <Form.Label>Provider API Name</Form.Label>
              <Form.Control
                type="text"
                name="api_name"
                placeholder="google, gitgub..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="ssoClientId">
              <Form.Label>Client ID</Form.Label>
              <Form.Control
                type="text"
                name="client_id"
                placeholder="Your OAuth client ID"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="ssoClientSecret">
              <Form.Label>Client Secret</Form.Label>
              <Form.Control
                type="text"
                name="client_secret"
                placeholder="Your OAuth client secret"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="ssoCallbackUrl">
              <Form.Label>Callback URL</Form.Label>
              <Form.Control
                type="url"
                name="callback_url"
                placeholder="https://yourapp.com/auth/provider/callback"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="authorizationUrl">
              <Form.Label>Authorization URL</Form.Label>
              <Form.Control
                type="url"
                name="authorization_url"
                placeholder="https://provider.com/oauth/v2/authorization"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="tokenUrl">
              <Form.Label>Token URL</Form.Label>
              <Form.Control
                type="url"
                name="token_url"
                placeholder="https://provider.com/oauth/v2/authorization"
                required
              />
            </Form.Group>

            <div className="d-grid mt-4">
              <Button
                variant="success"
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
                    Saving...
                  </>
                ) : (
                  "Add Provider"
                )}
              </Button>
            </div>
          </Form>
        </Stack>
      </div>
    </div>
  );
}

export default SSOProviderCreate;