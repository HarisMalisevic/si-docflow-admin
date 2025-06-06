import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert, Pagination, Container, Row, Col } from "react-bootstrap";

interface FinalizedDocument {
    id: number;
    content: any;
}

const ITEMS_PER_PAGE = 10;

const FinalizedDocumentsViewer: React.FC = () => {
    const [documents, setDocuments] = useState<FinalizedDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/finalized-documents");
                if (!res.ok) throw new Error(await res.text());
                setDocuments(await res.json());
            } catch (err: any) {
                setError(err.message || "Failed to load finalized documents.");
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    const indexOfLast = currentPage * ITEMS_PER_PAGE;
    const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
    const currentDocs = documents.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
    };

    return (
        <Container className="py-4">
            <Row>
                <Col>
                    <h2>Finalized Documents</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    {loading ? (
                        <div className="text-center py-3">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : (
                        <>
                            <Table striped bordered hover responsive size="sm">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>ID</th>
                                        <th>Content</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDocs.length > 0 ? (
                                        currentDocs.map((doc, idx) => (
                                            <tr key={doc.id}>
                                                <td>{indexOfFirst + idx + 1}</td>
                                                <td>{doc.id}</td>
                                                <td>
                                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                        {typeof doc.content === "string"
                                                            ? doc.content
                                                            : JSON.stringify(doc.content, null, 2)}
                                                    </pre>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-3">
                                                No finalized documents found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            {renderPagination()}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default FinalizedDocumentsViewer;