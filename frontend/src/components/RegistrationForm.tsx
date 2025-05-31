import { useState } from "react";
import { Button, Form, Spinner, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function RegistrationForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [emailInput, setEmailInput] = useState<string>('');
    const [passwordInput, setPasswordInput] = useState<string>('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const navigate = useNavigate();

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

        const registrationData = {
            email: emailInput,
            password: passwordInput,
        };

        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(registrationData),
            });

            if (response.ok) {
                navigate('/login');
            }
            else if (response.status == 409) {
                const newErrors: { email?: string; password?: string } = {};
                newErrors.email = "Email already registered";
                setErrors(newErrors);
            }
        } catch (error) {
            console.error("Error while registering:", error);
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
                    "Register"
                    )}
                </Button>
                </div>
            </Form>
            </Stack>
        </div>
        </div>
    );
}

export default RegistrationForm;