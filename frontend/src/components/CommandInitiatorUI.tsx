import { useState, useEffect } from "react";
import { Container, Alert, Spinner, Form, Button } from "react-bootstrap";
import { io, Socket } from "socket.io-client"; // Import Socket.IO client

interface RemoteProcessingResultAttributes {
    document_type_id: number;
    file_name: string;
    ocr_result: JSON;
}

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

    const [socket, setSocket] = useState<Socket | null>(null); // State to store the socket instance
    const [socketId, setSocketId] = useState<string | null>(null); // State to store the socket ID
    const [commandResponse, setCommandResponse] = useState<RemoteProcessingResultAttributes | null>(null); // State to store the command response

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initiatorKeyError, setInitiatorKeyError] = useState<string | null>(null);

    useEffect(() => {
        // Establish a connection to the Socket.IO server
        const newSocket = io("/processing");
        setSocket(newSocket);

        // Listen for the "connected" event to get the socket ID
        newSocket.on("connected", (id: string) => {
            console.log("Connected to Socket.IO server with ID:", id);
            setSocketId(id);
        });

        // Listen for the "processingResult" event to receive the response
        newSocket.on("processingResult", (data: RemoteProcessingResultAttributes, callback: (response: { success: boolean; message: string }) => void) => {
            console.log("Received processing result:", data);
            setCommandResponse(data); // Update the state with the received response
            setSuccessMessage("Remote processing finished successfully.");

            // Use the callback to confirm the data was processed
            callback({ success: true, message: "Processing result displayed successfully." });
        });

        // Handle disconnection
        newSocket.on("disconnect", () => {
            console.log("Disconnected from Socket.IO server");
            setSocketId(null);
        });

        // Cleanup on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

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

                const windowsAppInstancesResponse = await fetch("/api/windows-app-instance");
                if (!windowsAppInstancesResponse.ok) {
                    throw new Error("Failed to fetch Windows app instances.");
                }
                const windowsAppInstancesData = await windowsAppInstancesResponse.json();
                setWindowsAppInstances(windowsAppInstancesData);
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!selectedDocumentType) {
            newErrors.documentType = "Document type is required.";
        }
        if (!selectedWindowsAppInstance) {
            newErrors.appInstance = "Application instance is required.";
        }
        if (!fileName.trim()) {
            newErrors.fileName = "File name is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setError(null);
        setSuccessMessage(null);

        if (!initiatorKey) {
            setInitiatorKeyError("Initiator key is required. Please generate it first.");
            return;
        }

        if (!socketId) {
            setError("Socket ID is missing. Ensure the connection to the server is established.");
            return;
        }

        console.log("Selected Document Type:", selectedDocumentType);
        console.log("Selected Windows App Instance:", selectedWindowsAppInstance);
        console.log("File Name:", fileName);
        console.log("Initiator Key:", initiatorKey);
        console.log("Socket ID:", socketId);

        try {
            const response = await fetch("/api/remote/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "initiator-key": initiatorKey,
                    "socket-id": socketId, // Use the actual socket ID
                },
                body: JSON.stringify({
                    target_instance_id: selectedWindowsAppInstance,
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
            setInitiatorKeyError(null);
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
            <h1 className="mb-3">Initiate Remote Command</h1>

            {initiatorKey && (
                <Alert variant="success" className="mb-2">
                    Generated Initiator Key: <strong>{initiatorKey}</strong>
                </Alert>
            )}

            {initiatorKeyError && (
                <Alert variant="danger" className="mb-2">{initiatorKeyError}</Alert>
            )}

            <Button variant="secondary" onClick={handleGenerateKey} className="mb-3">
                Generate Key
            </Button>

            <Form className="mb-4">
                <Form.Group className="mb-3" controlId="documentTypeSelect">
                    <Form.Label>Document Type</Form.Label>
                    <Form.Select
                        value={selectedDocumentType}
                        onChange={(e) => setSelectedDocumentType(Number(e.target.value))}
                        isInvalid={!!errors.documentType}
                    >
                        <option value="">Select a Document Type</option>
                        {documentTypes.map((docType: any) => (
                            <option key={docType.id} value={docType.id}>
                                {docType.name}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.documentType}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="windowsAppInstanceSelect">
                    <Form.Label>Windows App Instance</Form.Label>
                    <Form.Select
                        value={selectedWindowsAppInstance}
                        onChange={(e) => setSelectedWindowsAppInstance(Number(e.target.value))}
                        isInvalid={!!errors.appInstance}
                    >
                        <option value="">Select a Windows App Instance</option>
                        {windowsAppInstances.map((instance: any) => (
                            <option key={instance.id} value={instance.id}>
                                {instance.title}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.appInstance}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="fileNameInput">
                    <Form.Label>File Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="example.pdf"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        isInvalid={!!errors.fileName}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.fileName}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Form>

            {commandResponse && (
                <div className="mt-4">
                    <h5>Command Response:</h5>
                    <textarea
                        readOnly
                        value={JSON.stringify(commandResponse.ocr_result, null, 2)}
                        style={{
                            width: "100%",
                            height: "200px",
                            backgroundColor: "#f8f9fa",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ced4da",
                            fontFamily: "monospace",
                        }}
                    />
                </div>
            )}
        </Container>
    );
}

export default CommandInitiatorUI;