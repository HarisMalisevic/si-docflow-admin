import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import io, { Socket } from "socket.io-client";

export enum ClientActionType {
  INSTANCE_STARTED = "instance_started",
  PROCESSING_REQ_SENT = "processing_req_sent",
  PROCESSING_RESULT_RECEIVED = "processing_res_received",
  COMMAND_RECEIVED = "command_received",
  INSTANCE_STOPPED = "instance_stopped"
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
  updatedAt?: string;
}

interface Initiator {
  id: number;
  initiator_key: string;
}

interface DocumentType {
  id: number;
  name: string;
}

const Logs: React.FC = () => {
  const [clientLogs, setClientLogs] = useState<ClientLogAttributes[]>([]);
  const [windowsAppInstances, setWindowsAppInstances] = useState<
    WindowsAppInstance[]
  >([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("");
  const [selectedClientAction, setSelectedClientAction] = useState<string>("");
  const [clientLogsLoading, setClientLogsLoading] = useState(true);
  const [clientLogsError, setClientLogsError] = useState<string | null>(null);

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

  const [socket, setSocket] = useState<Socket | null>(null);

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
      setClientLogs((prevLogs) => [
        newLog,
        ...prevLogs.filter((log) => log.id !== newLog.id),
      ]);
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
          setTransactionLogs((prevLogs) => [
            newLog,
            ...prevLogs.filter((log) => log.id !== newLog.id),
          ]);

          const initiatorsRes = await fetch("/api/auth/key/keys");
          if (initiatorsRes.ok) {
            const initiators = await initiatorsRes.json();
            setInitiators(initiators);
          }
        } catch (err) {
          console.error("Error updating on new transaction log:", err);
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

  return (
    <Container fluid="lg" className="py-4">
      <Row>
        <Col className="text-center mb-4">
          <h1>System Logs</h1>
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
                onChange={(e) => setSelectedInstanceId(e.target.value)}
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
                onChange={(e) => setSelectedClientAction(e.target.value)}
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
                  {filteredClientLogs.length > 0 ? (
                    filteredClientLogs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{index + 1}</td>
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
            {" "}
            <Form.Group controlId="transactionLogInitiatorFilter">
              <Form.Label>Filter by Initiator</Form.Label>
              <Form.Select
                value={selectedInitiatorId}
                onChange={(e) => setSelectedInitiatorId(e.target.value)}
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
                onChange={(e) => setSelectedTransactionStatus(e.target.value)}
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
          <Col md={0} lg={4}></Col>
        </Row>
        <Row>
          <Col>
            {transactionLogsLoading ? (
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
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Initiator</th>
                    <th>File Name</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactionLogs.length > 0 ? (
                    filteredTransactionLogs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{index + 1}</td>
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
                        <td>{formatDate(log.updatedAt)}</td>
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
            )}
          </Col>
        </Row>
      </section>
    </Container>
  );
};

export default Logs;
