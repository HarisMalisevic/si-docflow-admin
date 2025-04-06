import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Stack from "react-bootstrap/Stack";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import "../App.css";
import GoogleLogo from "../assets/GoogleLogo.svg";

function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleLogin = (): void => {
    // Zamijeniti sa rutom za google login
    window.location.href = "/auth/google";
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
            Dobrodošli u <br /> DocumentManager
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
            Prijava putem Google-a
          </Button>

          <div className="d-flex align-items-center my-2">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted small"> ili </span>
            <hr className="flex-grow-1" />
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginFormEmail">
              <Form.Label>Email adresa</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="primjer@primjer.ba"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginFormPassword">
              <Form.Label>Lozinka</Form.Label>
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
                    Učitavanje...
                  </>
                ) : (
                  "Prijava"
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
