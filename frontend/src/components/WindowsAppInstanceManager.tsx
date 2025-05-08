import { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Table, Alert, Modal } from "react-bootstrap";

enum OperationalMode {
    HEADLESS = "headless",
    STANDALONE = "standalone",
}

interface ApplicationInstance {
    id: number;
    title: string;
    location: string;
    machineId: string;
    operationalMode: OperationalMode;
    pollingFrequency?: number;
}

function WindowsAppInstanceManager() {
    const [title, setTitle] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [machineId, setMachineId] = useState<string>("");
    const [operationalMode, setOperationalMode] = useState<OperationalMode | null>(null);
    const [pollingFrequency, setPollingFrequency] = useState<number>(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [appInstances, setAppInstances] = useState<ApplicationInstance[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [changesMade, setChangesMade] = useState(false);
    const [showPollingFreqModal, setShowPollingFreqModal] = useState(false);
    const [waitingForSave, setWaitingForSave] = useState(false);

    const fetchAppInstances = async () => {
        // add after the routes are implemented
    };

    useEffect(() => { fetchAppInstances(); }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = "App instance title is required.";
        }
        if (!location.trim()) {
            newErrors.location = "App instance location is required.";
        }
        if (!machineId.trim()) {
            newErrors.machineId = "Machine ID is required.";
        }
        if(operationalMode === null) {
            newErrors.operationalMode = "Please select a valid operational mode."
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setTitle("");
        setLocation("");
        setMachineId("");
        setOperationalMode(null);
        setErrors({});
        setEditingId(null);
        setChangesMade(false);
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            // add after the routes are implemented

            setSuccessMessage("App instance successfully saved!");
            resetForm();
            window.setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error saving application instance: ", error);
        }
    };

    const handleCancel = () => {
        if (changesMade) {
            const confirmCancel = window.confirm("Are you sure you want to cancel your changes?");
            if (!confirmCancel) return;
        }
        
        resetForm();
    };

    const handleEdit = (appInstance: ApplicationInstance) => {
        setErrors({});
        setEditingId(appInstance.id);
        setTitle(appInstance.title);
        setLocation(appInstance.location);
        setMachineId(appInstance.machineId);
        setOperationalMode(appInstance.operationalMode);
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this application instance?");
        if (!confirmDelete) return;

        try {
            // add after the routes are implemented
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleSavePollingFrequency = async () => {
        setWaitingForSave(true);

        // add after the routes are implemented

        window.alert("Polling frequency successfully configured!");
        setShowPollingFreqModal(false);
        setPollingFrequency(0);
        setWaitingForSave(false);
    };

    const filteredAppInstances = appInstances.filter((app: any) =>
        app.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container fluid="md" className="py-4">
            <Row style={{ marginBottom: "70px" }} className="mb-4">
                <Col md={6} className="mx-auto" style={{ backgroundColor: "rgb(0,0,0,0.05)", padding: "20px", borderRadius: "8px" }}>
                    <h4 className="text-center mb-3">Add New Application Instance</h4>
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    <Form>
                        <Form.Group controlId="title" className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setChangesMade(true);
                                }}
                                isInvalid={!!errors.title}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.title}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="location" className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter location"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    setChangesMade(true);
                                }}
                                isInvalid={!!errors.location}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.location}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="machineId" className="mb-3">
                            <Form.Label>Machine ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter machine ID"
                                value={machineId}
                                onChange={(e) => {
                                    setMachineId(e.target.value);
                                    setChangesMade(true);
                                }}
                                isInvalid={!!errors.machineId}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.machineId}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="operationalMode">
                            <Form.Label>Operational Mode</Form.Label>
                            <Form.Select
                                value={operationalMode ?? ""}
                                onChange={(e) => {
                                    setOperationalMode(e.target.value ? e.target.value as OperationalMode : null);
                                    setChangesMade(true);
                                }}
                                isInvalid={!!errors.operationalMode}
                                >
                                <option value="">Select Mode</option>
                                {Object.values(OperationalMode).map((mode) => (
                                    <option key={mode} value={mode}>
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.operationalMode}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <div 
                            className="d-flex justify-content-between"
                            style={{ marginTop: "20px" }}
                        >
                            <Button variant="success" onClick={handleSave}>
                                Save
                            </Button>
                            <Button variant="outline-secondary" onClick={handleCancel} disabled={!changesMade && !editingId}>
                                Cancel
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
                                <th>Title</th>
                                <th>Location</th>
                                <th>Machine ID</th>
                                <th>Operational Mode</th>
                                <th>Polling Frequency</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppInstances.length > 0 ? (
                                filteredAppInstances.map((app: any, index: number) => (
                                    <tr key={app.id}>
                                        <td>{index + 1}</td>
                                        <td>{app.title}</td>
                                        <td>{app.location}</td>
                                        <td>{app.machineId}</td>
                                        <td>{app.operationalMode}</td>
                                        <td>{app.pollingFrequency ? app.pollingFrequency : '-'}</td>
                                        <td className="text-center" style={{ whiteSpace: "nowrap", padding: "5px 5px 0px 5px" }}>
                                            <Button
                                                variant="danger"
                                                className="me-2"
                                                size="sm"
                                                onClick={() => handleEdit(app)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="primary"
                                                className="me-2"
                                                size="sm"
                                                onClick={() => handleDelete(app.id)}
                                            >
                                                Delete
                                            </Button>
                                            
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setShowPollingFreqModal(true);
                                                    if (app.pollingFrequency) 
                                                        setPollingFrequency(app.pollingFrequency);
                                                    else 
                                                        setPollingFrequency(0);
                                                }}
                                            >
                                                Configure
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center">
                                        No application instances available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    <Modal show={showPollingFreqModal} onHide={() => setShowPollingFreqModal(false)}>
                        <Modal.Header closeButton>
                        <Modal.Title>Configure Polling Frequency</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Form>
                            <Form.Label>Polling Frequency (hours): {pollingFrequency}</Form.Label>
                            <Form.Range     //assuming that it's measured in hours
                                min={0}
                                max={24}
                                value={pollingFrequency}
                                onChange={(e) => setPollingFrequency(Number(e.target.value))}
                            />
                        </Form>
                        <div 
                            className="d-flex justify-content-between"
                            style={{ marginTop: "20px" }}
                        >
                            <Button 
                                variant="success" 
                                onClick={handleSavePollingFrequency} 
                                disabled={waitingForSave}
                            >
                                Save
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => {
                                    setShowPollingFreqModal(false);
                                    setPollingFrequency(0);
                                    setWaitingForSave(false);
                                }} 
                                disabled={waitingForSave}
                            >
                                Cancel
                            </Button>
                        </div>
                        </Modal.Body>
                    </Modal>
                </Col>
            </Row>
        </Container>
    );
}

export default WindowsAppInstanceManager;