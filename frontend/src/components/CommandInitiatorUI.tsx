import React, { useState, useEffect } from "react";
import { Container, Alert, Spinner, Form, Button } from "react-bootstrap";

function CommandInitiatorUI() {
    const [documentTypes, setDocumentTypes] = useState([]);
    const [windowsAppInstances, setWindowsAppInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedDocumentType, setSelectedDocumentType] = useState(0);
    const [selectedWindowsAppInstance, setSelectedWindowsAppInstance] = useState(0);
    const [fileName, setFileName] = useState("");
    const [initiatorKey, setInitiatorKey] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const documentTypesResponse = await fetch("/api/document-types");
                if (!documentTypesResponse.ok) {
                    throw new Error("Failed to fetch document types.");
                }
                const documentTypesData = await documentTypesResponse.json();
                setDocumentTypes(documentTypesData);
                console.log("Document Types:", documentTypesData);

                const windowsAppInstancesResponse = await fetch("/api/windows-app-instance");
                if (!windowsAppInstancesResponse.ok) {
                    throw new Error("Failed to fetch Windows app instances.");
                }
                const windowsAppInstancesData = await windowsAppInstancesResponse.json();
                setWindowsAppInstances(windowsAppInstancesData);
                console.log("Windows App Instances:", windowsAppInstancesData);
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!initiatorKey) {
            setError("Initiator key is required. Please generate it first.");
            return;
        }

        console.log("Selected Document Type:", selectedDocumentType);
        console.log("Selected Windows App Instance:", selectedWindowsAppInstance);
        console.log(typeof selectedDocumentType);
        console.log("File Name:", fileName);
        console.log("Initiator Key:", initiatorKey);
        console.log("Socket ID:", "some-socket-id"); // Replace with actual socket ID if available

        try {
            const response = await fetch("/api/remote/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "initiator-key": initiatorKey,
                    "socket-id": "some-socket-id", // Replace with actual socket ID if available
                },
                body: JSON.stringify({
                    target_instance_id: selectedWindowsAppInstance, // Numeric ID
                    document_type_id: selectedDocumentType,
                    file_name: fileName,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to start remote processing.");
            }

            const data = await response.json();
            setSuccessMessage("Remote processing started successfully.");
            console.log("Response:", data);
        } catch (err: any) {
            setError(err.message || "An error occurred while starting remote processing.");
        }
    };

    const handleGenerateKey = async () => {
        try {
            const response = await fetch("/api/auth/key", {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Failed to generate initiator key.");
            }

            const data = await response.json();
            setInitiatorKey(data.initiator_key);
        } catch (err: any) {
            setError(err.message || "An error occurred while generating the key.");
        }
    };

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <h1>Initiate Remote Command</h1>

            <Form onSubmit={handleSubmit} className="mb-4">
                <Form.Group className="mb-3" controlId="documentTypeSelect">
                    <Form.Label>Document Type</Form.Label>
                    <Form.Select
                        value={selectedDocumentType}
                        onChange={(e) => setSelectedDocumentType(Number(e.target.value))}
                        required
                    >
                        <option value="">Select a Document Type</option>
                        {documentTypes.map((docType: any) => (
                            <option key={docType.id} value={docType.id}>
                                {docType.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="windowsAppInstanceSelect">
                    <Form.Label>Windows App Instance</Form.Label>
                    <Form.Select
                        value={selectedWindowsAppInstance}
                        onChange={(e) => setSelectedWindowsAppInstance(Number(e.target.value))} // Parse value as a number
                        required
                    >
                        <option value="">Select a Windows App Instance</option>
                        {windowsAppInstances.map((instance: any) => (
                            <option key={instance.id} value={instance.id}>
                                {instance.title} {/* Display the title */}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="fileNameInput">
                    <Form.Label>File Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="example.pdf"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>

            <Button variant="secondary" onClick={handleGenerateKey} className="mb-3">
                Generate Remote Initiator Key
            </Button>

            {initiatorKey && (
                <Alert variant="success">
                    Generated Initiator Key: <strong>{initiatorKey}</strong>
                </Alert>
            )}
        </Container>
    );
}

export default CommandInitiatorUI;