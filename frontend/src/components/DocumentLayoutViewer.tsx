import { get } from "http";
import { useState, useEffect } from "react";
import { Container, Form, Row, Col, Button, Table, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function DocumentTypeViewer() {
    const [layoutName, setlayoutName] = useState("");
    const [documentType, setDocumentType] = useState("");
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedDocumentType, setSelectedDocumentType] = useState<number | "">("");
    const [canCreateNew, setCanCreateNew] = useState(false);
        
    const navigate = useNavigate();

    type DocumentType = {
        id: number;
        name: string;
        description?: string;
        document_layout_id?: number;
        created_by?: number;
    };

    const getDocumentTypes = async () => {
        try {
            const response = await fetch("/api/document-types");
            const data = await response.json();
            setDocumentTypes(data);
            setCanCreateNew(data.some((type: DocumentType) => type.document_layout_id === null));

        } catch (error) {
            console.error("Error while fetching document types: ", error);
        }
    };

    const fetchDocumentLayouts = async () => {
        try {
        const response = await fetch("/api/document-layouts");
        const data = await response.json();
        setDocuments(data);
        } catch (error) {
        console.error("Error fetching documents:", error);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this document?");
        if (!confirmDelete) return;

        try {
        const response = await fetch(`/api/document-layouts/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            fetchDocumentLayouts();
            setCanCreateNew(true);
        } else {
            console.error("Failed to delete document");
        }
        } catch (error) {
        console.error("Error deleting document:", error);
        }
    };

    const filteredDocuments = documents.filter((doc: any) => {
        const matchesSearchQuery = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const selectedType = documentTypes.find((type) => type.id === selectedDocumentType);
        const matchesDocumentType = selectedDocumentType === "" || selectedType?.document_layout_id === doc.id;
        return matchesSearchQuery && matchesDocumentType;
    });

    useEffect(() => {
        getDocumentTypes();
        fetchDocumentLayouts();
    }, []);

    return (
        <Container fluid="md" className="py-3">
        <Row className="d-flex justify-content-center">
            <Col md={8} className="text-center">
            <h1>Document Layouts</h1>
            </Col>
        </Row>
        <Row className="mb-4" style={{ marginTop: "70px" }}>
            <Col md={8} className="mx-auto">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex">
                <Form.Select
                    className="me-2"
                    style={{ width: "130px" }}
                    value={selectedDocumentType}
                    onChange={(e) => setSelectedDocumentType(e.target.value === "" ? "" : parseInt(e.target.value))}
                >
                    <option value="">All Types</option>
                    {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                        {type.name}
                    </option>
                    ))}
                </Form.Select>
                <Form.Control
                    type="text"
                    placeholder="Search documents"
                    className="me-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="secondary">Search</Button>
                </div>
                {canCreateNew && <Button
                variant="success"
                style={{ width: "7rem" }}
                onClick={() => navigate("create")}
                >
                Add New
                </Button>}
            </div>
            </Col>
        </Row>
        <Row className="mb-4">
            <Col md={8} className="mx-auto">
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Document Type</th>
                    <th style={{ width: "170px" }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc: any, index: number) => (
                    <tr key={doc.id}>
                        <td>{index + 1}</td>
                        <td>{doc.name}</td>
                        <td>
                        {documentTypes.find((type) => type.document_layout_id === doc.id)?.name || "Unknown"}
                        </td>
                        <td className="text-center align-middle whitespace-nowrap" style={{ whiteSpace: "nowrap", width: "auto" }}>
                            <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                style={{ width: "75px" }}
                                onClick={() => navigate(`edit/${doc.id}`)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                style={{ width: "75px" }}
                                onClick={() => handleDelete(doc.id)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={5} className="text-center">
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
    }

    export default DocumentTypeViewer;