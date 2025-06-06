import { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Table, Alert, Modal, Spinner } from "react-bootstrap";

enum OperationalMode {
    HEADLESS = "headless",
    STANDALONE = "standalone",
}

interface ScanningDevice {
    id: number;
    instance_id: number;
    device_name: string;
    is_chosen: boolean;
}

interface ApplicationInstance {
    id: number;
    title: string;
    location: string;
    machine_id: string;
    operational_mode: OperationalMode;
    polling_frequency?: number;
    availableDevices?: ScanningDevice[];
}

function WindowsAppInstanceManager() {
    const [title, setTitle] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [machineId, setMachineId] = useState<string>("");
    const [operationalMode, setOperationalMode] = useState<OperationalMode | null>(null);
    const [pollingFrequencyHours, setPollingFrequencyHours] = useState<number>(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [appInstances, setAppInstances] = useState<ApplicationInstance[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [pollingFreqEditingId, setPollingFreqEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [changesMade, setChangesMade] = useState(false);
    const [waitingForSave, setWaitingForSave] = useState(false);
    const [appInstancesLoading, setAppInstancesLoading] = useState(false);
    const [scanningDevices, setScanningDevices] = useState<ScanningDevice[]>([]);
    const [scanningDevicesLoading, setScanningDevicesLoading] = useState(false);
    const [chosenScanningDeviceId, setChosenScanningDeviceId] = useState<number | null>(null);

    const fetchAppInstances = async () => {
        setAppInstancesLoading(true);

        try {
            const response = await fetch("/api/windows-app-instance/available-devices");
            const data = await response.json();
            setAppInstances(data);
        } catch(error) {
            console.error("Error while fetching app instances: ", error);
        } finally {
            setAppInstancesLoading(false);
        }
    };

    const fetchDevicesForAppInstance_SetChosenDevice = async (instanceId: number) => { 
        setScanningDevicesLoading(true);

        try {
            const response = await fetch(`/api/available-device/app-instance/${instanceId}`);
            const data = await response.json();
            setScanningDevices(data);
            setChosenScanningDeviceId(
                data && data.length > 0 
                ? data.find((d: ScanningDevice) => d.is_chosen)?.id ?? null
                : null
            );
        } catch(error) {
            console.error(`Error while fetching scanning devices for instance ID ${instanceId}: `, error);
        } finally {
            setScanningDevicesLoading(false);
        }
    }

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
            const response = await fetch(
                editingId ? `/api/windows-app-instance/${editingId}` : `/api/windows-app-instance`, {
                method: editingId ? "PUT" : "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title,
                    location: location,
                    machine_id: machineId,
                    operational_mode: operationalMode,
                    polling_frequency: pollingFrequencyHours,
                }),
            });

            if (response.ok) {
                setSuccessMessage("App instance successfully saved!");
                fetchAppInstances();
                resetForm();
                setPollingFrequencyHours(0);
                window.setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                console.error("Failed to add app instance");
            }
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
        setPollingFrequencyHours(0);
    };

    const handleEdit = (appInstance: ApplicationInstance) => {
        setErrors({});
        setEditingId(appInstance.id);
        setTitle(appInstance.title);
        setLocation(appInstance.location);
        setMachineId(appInstance.machine_id);
        setOperationalMode(appInstance.operational_mode);
        setPollingFrequencyHours(appInstance.polling_frequency ?? 0);
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this application instance?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/windows-app-instance/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchAppInstances();
                resetForm();
                setPollingFrequencyHours(0);
            } else {
                console.error("Failed to delete app instance");
            }
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleConfigure = async (appInstance: ApplicationInstance) => {
        resetForm();
        setPollingFreqEditingId(appInstance.id);
        setPollingFrequencyHours(appInstance.polling_frequency ?? 0);

        if(appInstance.operational_mode === OperationalMode.HEADLESS){
            await fetchDevicesForAppInstance_SetChosenDevice(appInstance.id);  
        }
    }

    const handleSaveConfiguration = async (operationalMode : OperationalMode | undefined) => {
        if (operationalMode === OperationalMode.HEADLESS && scanningDevices.length > 0 && !chosenScanningDeviceId) {
            const newErrors: Record<string, string> = {};
            newErrors.chosenDevice = "Please choose a valid device."
            setErrors(newErrors);
            return;
        }

        setWaitingForSave(true);

        try {
            let saveConfigSuccessful: boolean = true;

            // update polling frequency
            const response = await fetch(`/api/windows-app-instance/${pollingFreqEditingId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    polling_frequency: pollingFrequencyHours,
                }),
            });

            if (response.ok) {
                setPollingFrequencyHours(0);

                // update chosen scanning device
                if (operationalMode === OperationalMode.HEADLESS) {
                    const responseScanningDevice = await fetch(`/api/available-device/app-instance/chosen-device/${pollingFreqEditingId}`, {
                        method: "PUT",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            device_id: chosenScanningDeviceId
                        }),
                    });

                    if (responseScanningDevice.ok) {
                        setScanningDevices([]);
                        setChosenScanningDeviceId(null);
                    } else {
                        console.error("Failed to select a scanning device");
                        saveConfigSuccessful = false;
                    }
                }
            } else {
                console.error("Failed to configure polling frequency");
                saveConfigSuccessful = false;
            }

            if (saveConfigSuccessful) {
                window.alert("Instance successfully configured!");
                setPollingFreqEditingId(null);
                setWaitingForSave(false);
                fetchAppInstances();
                setErrors({});
            }
            else {
                window.alert("Failed to save instance configuration!");
            }
        } catch (error) {
            console.error("Error saving instance configuration: ", error);
        }
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

            <Row className="align-items-end justify-content-between mb-3" style={{ marginTop: "70px" }}>
                <Col md={4}>
                    <Form className="d-flex" >
                        <Form.Control
                            type="text"
                            placeholder="Search app instances"
                            className="me-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="secondary">Search</Button>
                    </Form>
                </Col>
                <Col md="auto">
                    <Button
                        variant="success"
                        onClick={fetchAppInstances}
                        disabled={appInstancesLoading}
                        className="w-100 w-md-auto"
                        style={{ minWidth: "100px" }}
                    >
                    {appInstancesLoading ? (
                        <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        />
                    ) : (
                        "Refresh"
                    )}
                    </Button>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Location</th>
                                <th>Machine ID</th>
                                <th>Operational Mode</th>
                                <th>Polling Frequency (hours)</th>
                                <th>Scanning Device</th>
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
                                        <td>{app.machine_id}</td>
                                        <td>{app.operational_mode}</td>
                                        <td>{!app.polling_frequency ? '-' : app.polling_frequency}</td>
                                        <td>{
                                            app.operational_mode === OperationalMode.HEADLESS 
                                                ? (app.availableDevices && app.availableDevices.length > 0 
                                                    ? app.availableDevices[0].device_name 
                                                    : <strong>No device selected</strong>) 
                                                : '-'
                                        }</td>
                                        <td className="text-center" style={{ whiteSpace: "nowrap", padding: "5px 5px 0px 5px" }}>
                                            <Button
                                                variant="primary"
                                                className="me-2"
                                                size="sm"
                                                onClick={() => handleEdit(app)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                className="me-2"
                                                size="sm"
                                                onClick={() => handleDelete(app.id)}
                                            >
                                                Delete
                                            </Button>
                                            
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleConfigure(app)}
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

                    <Modal 
                        show={pollingFreqEditingId !== null && !scanningDevicesLoading} 
                        onHide={() => {
                            setPollingFreqEditingId(null);
                            setScanningDevices([]);
                            setChosenScanningDeviceId(null);
                        }}>
                        <Modal.Header closeButton>
                        <Modal.Title>Configure Application Instance</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Form>
                            <Form.Label>Polling Frequency (hours): {pollingFrequencyHours}</Form.Label>
                            <Form.Range     //assuming that it's measured in hours
                                min={0}
                                max={24}
                                value={pollingFrequencyHours}
                                onChange={(e) => setPollingFrequencyHours(Number(e.target.value))}
                            />

                            {(appInstances.find(
                                (instance) => instance.id === pollingFreqEditingId
                            )?.operational_mode === OperationalMode.HEADLESS) 
                            && <Form.Group controlId="scanning-device">
                                <Form.Label>Scanning Device</Form.Label>
                                <Form.Control
                                    as="select"
                                    onChange={(e) => {
                                        setChosenScanningDeviceId(Number(e.target.value) || null);
                                    }}
                                    value={chosenScanningDeviceId || 0}
                                    style={{ width: "250px" }}
                                    isInvalid={!!errors.chosenDevice}
                                >
                                    <option value={0}>Select Scanning Device</option>
                                    {scanningDevices.map((device) => (
                                    <option key={device.id} value={device.id}>
                                        {device.device_name}
                                    </option>
                                    ))}
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.chosenDevice}
                                </Form.Control.Feedback>
                            </Form.Group>}
                        </Form>
                        <div 
                            className="d-flex justify-content-between"
                            style={{ marginTop: "20px" }}
                        >
                            <Button 
                                variant="success" 
                                onClick={() => { 
                                    const operationalMode = appInstances.find(
                                        (instance) => instance.id === pollingFreqEditingId
                                    )?.operational_mode;
                                    
                                    handleSaveConfiguration(operationalMode); 
                                }} 
                                disabled={waitingForSave}
                            >
                                Save
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => {
                                    setPollingFreqEditingId(null);
                                    setPollingFrequencyHours(0);
                                    setWaitingForSave(false);
                                    setScanningDevices([]);
                                    setChosenScanningDeviceId(null);
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