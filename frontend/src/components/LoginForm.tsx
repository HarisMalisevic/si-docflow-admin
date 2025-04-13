import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, Stack, Form, Spinner } from "react-bootstrap";
import "../App.css";
import GoogleLogo from "../assets/GoogleLogo.svg";

function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [otherSSOProviders, setOtherSSOProviders] = useState<
    { name: string; callback_url: string }[] | null
  >(null);

  const fetchSSOProviders = async () => {
    try {
      const response = await fetch("/api/sso-providers/preview", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let data = await response.json();

      data = data.filter((provider: any) => provider.name.toLowerCase() !== "google");

      setOtherSSOProviders(data);
      console.log("Other SSO Providers:", data);
    } catch (error) {
      console.error("Error fetching SSO Providers:", error);
    }
  };

  useEffect(() => {
    fetchSSOProviders();
  }, []);

  const handleGoogleLogin = (): void => {
    // Zamijeniti sa rutom za google login
    window.location.href = "/auth/google";
  };
  
  const handleSSOLogin = (provider_name: string) => {
    window.location.href = `/auth/${provider_name}/login`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const loginData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      //zamijeniti sa rutom za tradicionalni login
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        // rutiranje na stranicu za managanje dokumentima
        // promijeniti i odgovarajuci path na app.tsx
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Greska prilikom prijave:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <Stack
          gap={3}
          className="p-4 p-md-5 border rounded-4 bg-white shadow"
          style={{ width: "100%" }}
        >
          <h2 className="text-center fw-bold mb-3">
            Welcome to <br /> Docflow
          </h2>

          <Button
            variant="light"
            className="btn-google d-flex align-items-center justify-content-center w-100 border"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <img
              src={GoogleLogo}
              alt="Google logo"
              width="18"
              height="18"
              className="me-2"
            />
            Log in with Google
          </Button>

          <Dropdown>
            <Dropdown.Toggle
              variant="light"
              className="d-flex align-items-center justify-content-center w-100 border"
              size="lg"
            >
              Log in with other SSO
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100 p-2">
              {otherSSOProviders && otherSSOProviders.length > 0 ? (
                otherSSOProviders.map((provider: any) => (
                  <Dropdown.Item as="div" className="p-0 mt-2" key={provider.name}>
                    <Button
                      variant="light"
                      className="btn-google d-flex align-items-center justify-content-center w-100 border"
                      size="lg"
                      onClick={() => handleSSOLogin(provider.name)}
                      disabled={isLoading}
                    >
                      {/* <img
                        src={provider.logoUrl}
                        alt={`${provider.name} logo`}
                        width="18"
                        height="18"
                        className="me-2"
                      /> */}
                      Log in with {provider.name}
                    </Button>
                  </Dropdown.Item>
                ))
              ) : (
                <Dropdown.Item as="div" className="text-center text-muted">
                  No SSO providers available
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>

          <div className="d-flex align-items-center my-2">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted small"> or </span>
            <hr className="flex-grow-1" />
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginFormEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="example@example.com"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginFormPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" />
            </Form.Group>

            <div className="d-grid mt-4">
              <Button
                variant="success"
                size="lg"
                type="submit"
                className="btn-custom-green"
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
                    Loading...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </div>
          </Form>
        </Stack>
      </div>
    </div>
  );
}

export default LoginForm;
