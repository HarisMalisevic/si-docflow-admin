import { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Table, Alert } from "react-bootstrap";

export const DocumentTypeViewer = () => {
    const [documentName, setDocumentName] = useState("");
    const [documentDescription, setDocumentDescription] = useState("");
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
    const [successMessage, setSuccessMessage] = useState("");

    const fetchDocuments = async () => {
        try {
            const response = await fetch("/api/document-types");
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    const validateForm = () => {
        const newErrors: { name?: string; description?: string } = {};
        if (!documentName.trim()) {
            newErrors.name = "Document name is required.";
        }
        if (!documentDescription.trim()) {
            newErrors.description = "Document description is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await fetch("/api/document-types", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: documentName,
                    description: documentDescription,
                }),
            });

            if (response.ok) {
                setDocumentName("");
                setDocumentDescription("");
                setErrors({});
                setSuccessMessage("Document successfully added!");
                fetchDocuments(); // Refresh the list
                setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3 seconds
            } else {
                console.error("Failed to add document");
            }
        } catch (error) {
            console.error("Error adding document:", error);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this document?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/document-types/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchDocuments(); 
            } else {
                console.error("Failed to delete document");
            }
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    const filteredDocuments = documents.filter((doc: any) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <Container fluid="md" className="py-4">
            <Row style={{ marginBottom: "70px" }} className="mb-4">
                <Col md={6} className="mx-auto" style={{ backgroundColor: "rgb(0,0,0,0.05)", padding: "20px", borderRadius: "8px" }}>
                    <h4 className="text-center mb-3">Add New Document</h4>
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="documentName" className="mb-3">
                            <Form.Label>Document Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter document name"
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value)}
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="documentDescription" className="mb-3">
                            <Form.Label>Document Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter document description"
                                value={documentDescription}
                                onChange={(e) => setDocumentDescription(e.target.value)}
                                isInvalid={!!errors.description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.description}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <div className="text-center">
                            <Button variant="primary" type="submit">
                                Add Document
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>

            <Row className="mb-4" style={{ marginTop: "70px" }}>
                <Col md={8} className="mx-auto">
                    <Form className="d-flex w-50 mb-3" >
                        <Form.Control
                            type="text"
                            placeholder="Search documents"
                            className="me-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="secondary">Search</Button>
                    </Form>
                
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.length > 0 ? (
                                filteredDocuments.map((doc: any, index: number) => (
                                    <tr key={doc.id}>
                                        <td>{index + 1}</td>
                                        <td>{doc.name}</td>
                                        <td>{doc.description}</td>
                                        <td className="text-center">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(doc.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center">
                                        No documents available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};