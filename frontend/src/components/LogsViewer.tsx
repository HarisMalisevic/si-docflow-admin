import React, { useState, useEffect, use } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Spinner,
  Alert,
  Badge,
  Pagination,
  Button,
} from "react-bootstrap";
import io, { Socket } from "socket.io-client";

export enum SeverityLevel {
  INFORMATION = "Information",
  WARNING = "Warning",
  ERROR = "Error",
  CRITICAL = "Critical",
  VERBOSE = "Verbose",
}

export enum ClientActionType {
  INSTANCE_STARTED = "instance_started",
  PROCESSING_REQ_SENT = "processing_req_sent",
  PROCESSING_RESULT_RECEIVED = "processing_res_received",
  COMMAND_RECEIVED = "command_received",
  INSTANCE_STOPPED = "instance_stopped",
}

export enum TransactionStatus {
  STARTED = "started",
  FORWARDED = "forwarded",
  FINISHED = "finished",
  FAILED = "failed",
}

interface ClientLogAttributes {
  id: number;
  instance_id: number;
  action: ClientActionType;
  createdAt?: string;
}

interface WindowsAppInstance {
  id: number;
  title: string;
}

interface RemoteTransactionAttributes {
  id: number;
  initiator_id: number;
  target_instance_id: number;
  document_type_id: number;
  file_name: string;
  status: TransactionStatus;
  socket_id: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AppOrSystemLog {
    id: number;
    level: SeverityLevel;
    source: string;
    event_id: string;
    task_category: string;
    app_instance_id: number;
    createdAt?: string;
}

interface Initiator {
  id: number;
  initiator_key: string;
}

interface DocumentType {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 5;

const Logs: React.FC = () => {
  const [clientLogs, setClientLogs] = useState<ClientLogAttributes[]>([]);
  const [windowsAppInstances, setWindowsAppInstances] = useState<
    WindowsAppInstance[]
  >([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("");
  const [selectedClientAction, setSelectedClientAction] = useState<string>("");
  const [clientLogsLoading, setClientLogsLoading] = useState(true);
  const [clientLogsError, setClientLogsError] = useState<string | null>(null);
  const [currentClientLogPage, setCurrentClientLogPage] = useState(1);

  const [transactionLogs, setTransactionLogs] = useState<
    RemoteTransactionAttributes[]
  >([]);
  const [initiators, setInitiators] = useState<Initiator[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedInitiatorId, setSelectedInitiatorId] = useState<string>("");
  const [selectedTransactionStatus, setSelectedTransactionStatus] =
    useState<string>("");
  const [transactionLogsLoading, setTransactionLogsLoading] = useState(true);
  const [transactionLogsError, setTransactionLogsError] = useState<
    string | null
  >(null);
  const [currentTransactionLogsPage, setCurrentTransactionLogsPage] =
    useState(1);

  // Application logs
  const [applicationLogs, setApplicationLogs] = useState<AppOrSystemLog[]>([]);
  const [appLogLoading, setAppLogLoading] = useState(true);
  const [appLogError, setAppLogError] = useState<string | null>(null);
  const [appLogInstance, setAppLogInstance] = useState<string>("");
  const [appLogLevel, setAppLogLevel] = useState<string>("");
  const [currentAppLogPage, setCurrentAppLogPage] = useState(1);

  // System logs
  const [systemLogs, setSystemLogs] = useState<AppOrSystemLog[]>([]);
  const [sysLogLoading, setSysLogLoading] = useState(true);
  const [sysLogError, setSysLogError] = useState<string | null>(null);
  const [sysLogInstance, setSysLogInstance] = useState<string>("");
  const [sysLogLevel, setSysLogLevel] = useState<string>("");
  const [currentSystemLogPage, setCurrentSystemLogPage] = useState(1);


  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchAppLogs = async () => {
      setAppLogLoading(true);
      setAppLogError(null);
      try {
        const res = await fetch("/api/application-logs/");
        if (!res.ok) throw new Error(await res.text());
        setApplicationLogs(await res.json());
      } catch (err: any) {
        setAppLogError(err.message || "Failed to load application logs.");
      } finally {
        setAppLogLoading(false);
      }
    };

    // System Logs
    const fetchSysLogs = async () => {
      setSysLogLoading(true);
      setSysLogError(null);
      try {
        const res = await fetch("/api/system-logs");
        if (!res.ok) throw new Error(await res.text());
        setSystemLogs(await res.json());
      } catch (err: any) {
        setSysLogError(err.message || "Failed to load system logs.");
      } finally {
        setSysLogLoading(false);
      }
    };

  useEffect(() => {
    const fetchClientLogData = async () => {
      setClientLogsLoading(true);
      setClientLogsError(null);
      try {
        const [logsRes, instancesRes] = await Promise.all([
          fetch("/api/client-log"),
          fetch("/api/windows-app-instance"),
        ]);
        if (!logsRes.ok) {
          const errorText = await logsRes.text();
          throw new Error(
            `Failed to fetch client logs: ${logsRes.status} ${errorText}`
          );
        }
        if (!instancesRes.ok) {
          const errorText = await instancesRes.text();
          throw new Error(
            `Failed to fetch Windows app instances: ${instancesRes.status} ${errorText}`
          );
        }
        setClientLogs(await logsRes.json());
        setWindowsAppInstances(await instancesRes.json());
      } catch (err: any) {
        setClientLogsError(err.message || "Failed to load client log data.");
      } finally {
        setClientLogsLoading(false);
      }
    };

    const fetchTransactionData = async () => {
      setTransactionLogsLoading(true);
      setTransactionLogsError(null);
      try {
        const [logsRes, initiatorsRes, docTypesRes] = await Promise.all([
          fetch("/api/remote-transactions"),
          fetch("/api/auth/key/keys"),
          fetch("/api/document-types"),
        ]);
        if (!logsRes.ok) {
          const errorText = await logsRes.text();
          throw new Error(
            `Failed to fetch transaction logs: ${logsRes.status} ${errorText}`
          );
        }
        if (!initiatorsRes.ok) {
          const errorText = await initiatorsRes.text();
          throw new Error(
            `Failed to fetch initiators: ${initiatorsRes.status} ${errorText}`
          );
        }
        if (!docTypesRes.ok) {
          const errorText = await docTypesRes.text();
          throw new Error(
            `Failed to fetch document types: ${docTypesRes.status} ${errorText}`
          );
        }
        setTransactionLogs(await logsRes.json());
        setInitiators(await initiatorsRes.json());
        setDocumentTypes(await docTypesRes.json());
      } catch (err: any) {
        setTransactionLogsError(
          err.message || "Failed to load transaction log data."
        );
      } finally {
        setTransactionLogsLoading(false);
      }
    };

    fetchAppLogs();
    fetchSysLogs();

    fetchClientLogData();
    fetchTransactionData();

    const newSocket = io(`/logs`);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server on /logs namespace!");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server /logs namespace.");
    });

    newSocket.on("new_client_log", (newLog: ClientLogAttributes) => {
      setClientLogs((prevLogs) => {
        const updatedLogs = [
          newLog,
          ...prevLogs.filter((log) => log.id !== newLog.id),
        ];
        return updatedLogs.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
      });
    });
    newSocket.on("updated_client_log", (updatedLog: ClientLogAttributes) => {
      setClientLogs((prevLogs) =>
        prevLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log))
      );
    });
    newSocket.on("deleted_client_log", (data: { id: number }) => {
      setClientLogs((prevLogs) => prevLogs.filter((log) => log.id !== data.id));
    });

    newSocket.on(
      "new_transaction_log",
      async (newLog: RemoteTransactionAttributes) => {
        try {
          setTransactionLogs((prevLogs) => {
            const updatedLogs = [
              newLog,
              ...prevLogs.filter((log) => log.id !== newLog.id),
            ];
            return updatedLogs.sort(
              (a, b) =>
                new Date(b.updatedAt || b.createdAt || 0).getTime() -
                new Date(a.updatedAt || a.createdAt || 0).getTime()
            );
          });

          const initiatorsRes = await fetch("/api/auth/key/keys");
          if (initiatorsRes.ok) {
            const initiators = await initiatorsRes.json();
            setInitiators(initiators);
          }
        } catch (err) {
          console.error("Error processing new_transaction_log event:", err);
        }
      }
    );
    newSocket.on(
      "updated_transaction_log",
      (updatedLog: RemoteTransactionAttributes) => {
        setTransactionLogs((prevLogs) =>
          prevLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log))
        );
      }
    );
    newSocket.on("deleted_transaction_log", (data: { id: number }) => {
      setTransactionLogs((prevLogs) =>
        prevLogs.filter((log) => log.id !== data.id)
      );
    });
    
    return () => {
      newSocket.off("new_client_log");
      newSocket.off("updated_client_log");
      newSocket.off("deleted_client_log");
      newSocket.off("new_transaction_log");
      newSocket.off("updated_transaction_log");
      newSocket.off("deleted_transaction_log");
      newSocket.disconnect();
    };
  }, []);

  
    const handleAppRefresh = () => {
      setCurrentAppLogPage(1);
      fetchAppLogs();
    }

    const handleSystemRefresh = () => {
      setCurrentSystemLogPage(1);
      fetchSysLogs();
    }


  const filteredClientLogs = clientLogs.filter((log) => {
    const matchesInstance =
      !selectedInstanceId || log.instance_id === parseInt(selectedInstanceId);
    const matchesAction =
      !selectedClientAction || log.action === selectedClientAction;
    return matchesInstance && matchesAction;
  });

  const filteredTransactionLogs = transactionLogs.filter((log) => {
    const matchesInitiator =
      !selectedInitiatorId ||
      log.initiator_id === parseInt(selectedInitiatorId);
    const matchesStatus =
      !selectedTransactionStatus || log.status === selectedTransactionStatus;
    return matchesInitiator && matchesStatus;
  });

  const filteredAppLogs = applicationLogs.filter((log) => {
    const matchesInstance = !appLogInstance || log.app_instance_id === parseInt(appLogInstance);
    const matchesLevel = !appLogLevel || log.level === appLogLevel;
    return matchesInstance && matchesLevel;
  });

  const filteredSysLogs = systemLogs.filter((log) => {
    const matchesInstance = !sysLogInstance || log.app_instance_id === parseInt(sysLogInstance);
    const matchesLevel = !sysLogLevel || log.level === sysLogLevel;
    return matchesInstance && matchesLevel;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getTransactionStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.STARTED:
        return "info";
      case TransactionStatus.FORWARDED:
        return "primary";
      case TransactionStatus.FINISHED:
        return "success";
      case TransactionStatus.FAILED:
        return "danger";
      default:
        return "secondary";
    }
  };

  const indexOfLastClientLog = currentClientLogPage * ITEMS_PER_PAGE;
  const indexOfFirstClientLog = indexOfLastClientLog - ITEMS_PER_PAGE;
  const currentClientLogs = filteredClientLogs.slice(
    indexOfFirstClientLog,
    indexOfLastClientLog
  );
  const totalClientLogPages = Math.ceil(
    filteredClientLogs.length / ITEMS_PER_PAGE
  );

  const indexOfLastTransactionLog = currentTransactionLogsPage * ITEMS_PER_PAGE;
  const indexOfFirstTransactionLog = indexOfLastTransactionLog - ITEMS_PER_PAGE;
  const currentTransactionLogs = filteredTransactionLogs.slice(
    indexOfFirstTransactionLog,
    indexOfLastTransactionLog
  );
  const totalTransactionLogsPages = Math.ceil(
    filteredTransactionLogs.length / ITEMS_PER_PAGE
  );

  const indexOfLastAppLog = currentAppLogPage * ITEMS_PER_PAGE;
  const indexOfFirstAppLog = indexOfLastAppLog - ITEMS_PER_PAGE;
  const currentAppLogs = filteredAppLogs.slice(
    indexOfFirstAppLog,
    indexOfLastAppLog
  );
  const totalAppLogsPages = Math.ceil(
    filteredAppLogs.length / ITEMS_PER_PAGE
  );

  const indexOfLastSystemLog = currentSystemLogPage * ITEMS_PER_PAGE;
  const indexOfFirstSystemLog = indexOfLastSystemLog - ITEMS_PER_PAGE;
  const currentSystemLogs = filteredSysLogs.slice(
    indexOfFirstSystemLog,
    indexOfLastSystemLog
  );
  const totalSystemLogsPages = Math.ceil(
    filteredSysLogs.length / ITEMS_PER_PAGE
  );

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;
    const items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => onPageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination className="justify-content-center mt-3">{items}</Pagination>
    );
  };

  return (
    <Container fluid="lg" className="py-4">
      <Row>
        <Col className="text-center mb-4">
          <h1> Client & Transaction logs</h1>
        </Col>
      </Row>

      <section id="client-logs">
        <Row>
          <Col>
            <h2 className="mb-3">Client Logs</h2>
          </Col>
        </Row>
        <Row className="mb-3 align-items-end">
          <Col md={4}>
            <Form.Group controlId="clientLogInstanceFilter">
              <Form.Label>Filter by Windows App Instance</Form.Label>
              <Form.Select
                value={selectedInstanceId}
                onChange={(e) => {
                  setSelectedInstanceId(e.target.value);
                  setCurrentClientLogPage(1);
                }}
                aria-label="Filter by Windows App Instance"
              >
                <option value="">All Instances</option>
                {windowsAppInstances.map((instance) => (
                  <option key={instance.id} value={instance.id}>
                    {instance.title} (ID: {instance.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="clientLogActionFilter">
              <Form.Label>Filter by Client Action Type</Form.Label>
              <Form.Select
                value={selectedClientAction}
                onChange={(e) => {
                  setSelectedClientAction(e.target.value);
                  setCurrentClientLogPage(1);
                }}
                aria-label="Filter by Client Action Type"
              >
                <option value="">All Actions</option>
                {Object.values(ClientActionType).map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            {clientLogsLoading && clientLogs.length === 0 ? (
              <div className="text-center py-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">
                    Loading Client Logs...
                  </span>
                </Spinner>
              </div>
            ) : clientLogsError ? (
              <Alert variant="danger" className="mt-3">
                {clientLogsError}
              </Alert>
            ) : (
              <>
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Instance</th>
                      <th>Action</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClientLogs.length > 0 ? (
                      currentClientLogs.map((log, index) => (
                        <tr key={log.id}>
                          <td>{indexOfFirstClientLog + index + 1}</td>
                          <td>
                            {windowsAppInstances.find(
                              (inst) => inst.id === log.instance_id
                            )?.title || `ID: ${log.instance_id}`}
                          </td>
                          <td>{log.action}</td>
                          <td>{formatDate(log.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-3">
                          No client logs found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {renderPagination(
                  currentClientLogPage,
                  totalClientLogPages,
                  setCurrentClientLogPage
                )}
              </>
            )}
          </Col>
        </Row>
      </section>

      <section id="transaction-logs" className="mt-5">
        <Row>
          <Col>
            <h2 className="mb-3">Transaction Logs</h2>
          </Col>
        </Row>
        <Row className="mb-3 align-items-end">
          <Col md={6} lg={4}>
            <Form.Group controlId="transactionLogInitiatorFilter">
              <Form.Label>Filter by Initiator</Form.Label>
              <Form.Select
                value={selectedInitiatorId}
                onChange={(e) => {
                  setSelectedInitiatorId(e.target.value);
                  setCurrentTransactionLogsPage(1);
                }}
                aria-label="Filter by Initiator"
              >
                <option value="">All Initiators</option>
                {initiators.map((initiator) => (
                  <option key={initiator.id} value={initiator.id}>
                    {initiator.initiator_key} (ID: {initiator.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} lg={4}>
            <Form.Group controlId="transactionLogStatusFilter">
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select
                value={selectedTransactionStatus}
                onChange={(e) => {
                  setSelectedTransactionStatus(e.target.value);
                  setCurrentTransactionLogsPage(1);
                }}
                aria-label="Filter by Status"
              >
                <option value="">All Statuses</option>
                {Object.values(TransactionStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            {transactionLogsLoading && transactionLogs.length === 0 ? (
              <div className="text-center py-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">
                    Loading Transaction Logs...
                  </span>
                </Spinner>
              </div>
            ) : transactionLogsError ? (
              <Alert variant="danger" className="mt-3">
                {transactionLogsError}
              </Alert>
            ) : (
              <>
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Initiator</th>
                      <th>File Name</th>
                      <th>Status</th>
                      <th>Socket ID</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactionLogs.length > 0 ? (
                      currentTransactionLogs.map((log, index) => (
                        <tr key={log.id}>
                          <td>{indexOfFirstTransactionLog + index + 1}</td>
                          <td>
                            {initiators.find(
                              (init) => init.id === log.initiator_id
                            )?.initiator_key || `ID: ${log.initiator_id}`}
                          </td>
                          <td>{log.file_name}</td>
                          <td>
                            <Badge bg={getTransactionStatusBadge(log.status)}>
                              {log.status}
                            </Badge>
                          </td>
                          <td>{log.socket_id}</td>
                          <td>{formatDate(log.updatedAt || log.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-3">
                          No transaction logs found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {renderPagination(
                  currentTransactionLogsPage,
                  totalTransactionLogsPages,
                  setCurrentTransactionLogsPage
                )}
              </>
            )}
          </Col>
        </Row>
      </section>
      <section id="application-logs" className="mt-5">
        <Row>
          <Col>
            <h2 className="mb-3">Application Logs</h2>
          </Col>
        </Row>
        <Row className="mb-3 align-items-end">
          <Col md={4}>
            <Form.Group controlId="appLogInstanceFilter">
              <Form.Label>Filter by Instance</Form.Label>
              <Form.Select
                value={appLogInstance}
                onChange={(e) => setAppLogInstance(e.target.value)}
              >
                <option value="">All Instances</option>
                {windowsAppInstances.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.title} (ID: {inst.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="appLogLevelFilter">
              <Form.Label>Filter by Severity</Form.Label>
              <Form.Select
                value={appLogLevel}
                onChange={(e) => setAppLogLevel(e.target.value)}
              >
                <option value="">All Severity Levels</option>
                {Object.values(SeverityLevel).map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
           <Col md={3} xs={12}>
              {/* empty column for better visual distribution of elements */}
            </Col>
            <Col
              md={1}
              xs={2}
              className="d-flex align-items-end justify-content-md-end justify-content-center"
            >
            <Button
              variant="success"
              onClick={handleAppRefresh}
              disabled={appLogLoading}
              className="w-100 w-md-auto"
              style={{ minWidth: "100px" }}
            >
            {appLogLoading ? (
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
        <Row>
          <Col>
            {appLogLoading && applicationLogs.length === 0 ? (
              <div className="text-center py-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">
                    Loading Application Logs...
                  </span>
                </Spinner>
              </div>
            ) : appLogError ? (
              <Alert variant="danger" className="mt-3">
                {appLogError}
              </Alert>
            ) : (
              <>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Instance</th>
                    <th>Severity Level</th>
                    <th>Source</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppLogs.length > 0 ? (
                    currentAppLogs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{indexOfFirstAppLog + index + 1}</td>
                        <td>
                          {windowsAppInstances.find(
                            (inst) => inst.id === log.app_instance_id
                          )?.title || `ID: ${log.app_instance_id}`}
                        </td>
                        <td>{log.level}</td>
                        <td>{log.source}</td>
                        <td>{formatDate(log.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-3">
                        No application logs found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {renderPagination(
                  currentAppLogPage,
                  totalAppLogsPages,
                  setCurrentAppLogPage
                )}
              </>
            )}
          </Col>
        </Row>
      </section>
      <section id="system-logs" className="mt-5">
        <Row>
          <Col>
            <h2 className="mb-3">System Logs</h2>
          </Col>
        </Row>
        <Row className="mb-3 align-items-end">
          <Col md={4}>
            <Form.Group controlId="sysLogInstanceFilter">
              <Form.Label>Filter by Instance</Form.Label>
              <Form.Select
                value={sysLogInstance}
                onChange={(e) => setSysLogInstance(e.target.value)}
              >
                <option value="">All Instances</option>
                {windowsAppInstances.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.title} (ID: {inst.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="sysLogLevelFilter">
              <Form.Label>Filter by Severity</Form.Label>
              <Form.Select
                value={sysLogLevel}
                onChange={(e) => setSysLogLevel(e.target.value)}
              >
                <option value="">All Severity Levels</option>
                {Object.values(SeverityLevel).map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} xs={12}>
              {/* empty column for better visual distribution of elements */}
            </Col>
            <Col
              md={1}
              xs={2}
              className="d-flex align-items-end justify-content-md-end justify-content-center"
            >
            <Button
              variant="success"
              onClick={handleSystemRefresh}
              disabled={sysLogLoading}
              className="w-100 w-md-auto"
              style={{ minWidth: "100px" }}
            >
            {sysLogLoading ? (
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
        <Row>
          <Col>
            {sysLogLoading && systemLogs.length === 0 ? (
              <div className="text-center py-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading System Logs...</span>
                </Spinner>
              </div>
            ) : sysLogError ? (
              <Alert variant="danger" className="mt-3">{sysLogError}</Alert>
            ) : (
              <>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Instance</th>
                    <th>Severity Level</th>
                    <th>Source</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSystemLogs.length > 0 ? (
                    currentSystemLogs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{indexOfFirstSystemLog + index + 1}</td>
                        <td>{windowsAppInstances.find(inst => inst.id === log.app_instance_id)?.title || `ID: ${log.app_instance_id}`}</td>
                        <td>{log.level}</td>
                        <td>{log.source}</td>
                        <td>{formatDate(log.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-3">
                        No system logs found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {renderPagination(
                  currentSystemLogPage,
                  totalSystemLogsPages,
                  setCurrentSystemLogPage
                )}
              </>
            )}
          </Col>
        </Row>
      </section>

    </Container>
  );
};

export default Logs;
