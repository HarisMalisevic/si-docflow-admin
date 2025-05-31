import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Dropdown, Stack, Form, Spinner } from "react-bootstrap";
import "../App.css";
import GoogleLogo from "../assets/GoogleLogo.svg";

function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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

      data = data.filter((provider: any) => provider.display_name.toLowerCase() !== "google");

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

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!emailInput.trim()) {
        newErrors.email = "Email is required.";
    }
    else if(!isValidEmail(emailInput)) {
      newErrors.email = "Invalid email format";
    }
    if (!passwordInput.trim()) {
        newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const loginData = {
      email: emailInput,
      password: passwordInput,
    };

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/home";
      }
      else {
        const newErrors: { email?: string; password?: string } = {};
        newErrors.password = "Invalid password";
        setErrors(newErrors);
      }
    } catch (error) {
      console.error("Login error:", error);
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
            Welcome to DocFlow
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
                  <Dropdown.Item as="div" className="p-0 mt-2" key={provider.display_name}>
                    <Button
                      variant="light"
                      className="btn-google d-flex align-items-center justify-content-center w-100 border"
                      size="lg"
                      onClick={() => handleSSOLogin(provider.display_name)}
                      disabled={isLoading}
                    >
                      {/* <img
                        src={provider.logoUrl}
                        alt={`${provider.display_name} logo`}
                        width="18"
                        height="18"
                        className="me-2"
                      /> */}
                      Log in with {provider.display_name}
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

          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-2" controlId="loginFormEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                value={emailInput}
                placeholder="example@example.com"
                onChange={(e) => setEmailInput(e.target.value)}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                  {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-2" controlId="loginFormPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                  {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid mt-4">
              <Button
                variant="success"
                size="lg"
                onClick={handleSubmit}
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
          <div className="d-flex justify-content-center align-items-center mt-3">
          <div className="text-muted me-2">Don't have an account?</div>
          <Link
            to="/register"
            className="fw-semibold text-success text-decoration-none"
          >
            Register
          </Link>
        </div>
        </Stack>
      </div>
    </div>
  );
}

export default LoginForm;
