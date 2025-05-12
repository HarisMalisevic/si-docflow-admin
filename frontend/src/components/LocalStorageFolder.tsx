import { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Table, Alert, Badge } from "react-bootstrap";

interface LocalStorageFolder {
  id: number;
  title: string;
  description: string;
  path: string;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
}

function LocalStorageFolderManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [path, setPath] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [createdBy, setCreatedBy] = useState<number | "">("");
  const [updatedBy, setUpdatedBy] = useState<number | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [folders, setFolders] = useState<LocalStorageFolder[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [changesMade, setChangesMade] = useState(false);
  const [user, setUser] = useState<{ id: number } | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
      fetch("/auth/profile", { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user profile");
          return res.json();
        })
        .then((data) => {
          setUser({ id: data.id });
        })
        .catch((err) => {
          console.error("Error loading user:", err);
        });
    }, []);

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/local-storage-folder");
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  const toggleActive = async (ls: LocalStorageFolder) => {
    setError(null);
    setSuccessMessage("");
    const originalStatus = ls.is_active;
    setFolders((prev) =>
      prev.map((ep) =>
        ep.id === ls.id ? { ...ep, is_active: !ep.is_active } : ep
      )
    );
    const payload = {
      is_active: !ls.is_active,
    };

    try {
      const response = await fetch(`/api/local-storage-folder/${ls.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(errorData.message || "Failed to update status");
      }
      setSuccessMessage(
        `Endpoint ${originalStatus ? "deactivated" : "activated"}.`
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Toggle active error:", error);
      setError(error.message || "Failed to update status.");
      setFolders((prev) =>
        prev.map((ep) =>
          ep.id === ls.id ? { ...ep, is_active: originalStatus } : ep
        )
      );
    }
  };


  useEffect(() => {
    fetchFolders();
  }, []);

  const validateForm = () => {
    const errs: Record<string,string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!path.trim()) errs.path = "Path is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPath("");
    setIsActive(true);
    setUpdatedBy("");
    setErrors({});
    setEditingId(null);
    setChangesMade(false);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      title,
      description,
      path,
      is_active: isActive,
      created_by: Number(createdBy),
      updated_by: editingId ? Number(updatedBy) || undefined : undefined,
    };

    try {
      const res = await fetch(
        editingId
          ? `/api/local-storage-folder/${editingId}`
          : `/api/local-storage-folder`,
        {
          method: editingId ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setSuccessMessage(`Folder ${editingId ? "updated" : "created"} successfully!`);
        fetchFolders();
        resetForm();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error("Save failed");
      }
    } catch (err) {
      console.error("Error saving folder:", err);
    }
  };

  const handleCancel = () => {
    if (changesMade) {
      if (!window.confirm("Discard unsaved changes?")) return;
    }
    resetForm();
  };

  const handleEdit = (f: LocalStorageFolder) => {
    setErrors({});
    setEditingId(f.id);
    setTitle(f.title);
    setDescription(f.description);
    setPath(f.path);
    setIsActive(f.is_active);
    setCreatedBy(f.created_by);
    setUpdatedBy(f.updated_by ?? "");
    setChangesMade(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this folder permanently?")) return;
    try {
      const res = await fetch(`/api/local-storage-folder/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchFolders();
        if (editingId === id) resetForm();
      } else {
        console.error("Delete failed");
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
    }
  };

  const filtered = folders.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container fluid="md" className="py-4">
      <Row className="mb-5">
        <Col md={6} className="mx-auto p-4" style={{ backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 8 }}>
          <h4 className="text-center mb-4">
            {editingId ? "Edit Folder" : "Add New Folder"}
          </h4>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          <Form>
            <Form.Group controlId="title" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                placeholder="Folder title"
                isInvalid={!!errors.title}
                onChange={e => { setTitle(e.target.value); setChangesMade(true); }}
              />
              <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={description}
                placeholder="Brief description"
                isInvalid={!!errors.description}
                onChange={e => { setDescription(e.target.value); setChangesMade(true); }}
              />
              <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="path" className="mb-3">
              <Form.Label>Path</Form.Label>
              <Form.Control
                type="text"
                value={path}
                placeholder="/var/data/folder"
                isInvalid={!!errors.path}
                onChange={e => { setPath(e.target.value); setChangesMade(true); }}
              />
              <Form.Control.Feedback type="invalid">{errors.path}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="isActive" className="mb-3">
              <Form.Check
                type="switch"
                label="Active"
                checked={isActive}
                onChange={e => { setIsActive(e.target.checked); setChangesMade(true); }}
              />
            </Form.Group>

            <div className="d-flex justify-content-between mt-4">
              <Button variant="success" onClick={handleSave}>
                {editingId ? "Update" : "Create"}
              </Button>
              <Button variant="outline-secondary" onClick={handleCancel} disabled={!changesMade && !editingId}>
                Cancel
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      <Row>
        <Col md={8} className="mx-auto">
          <Form className="d-flex mb-3 w-50">
            <Form.Control
              type="text"
              placeholder="Search folders"
              className="me-2"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button variant="secondary" onClick={() => {/* optionally refetch or clear */}}>
              Search
            </Button>
          </Form>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{width: '5%'}}>#</th>
                <th style={{width: '15%'}}>Title</th>
                <th style={{width: '15%'}}>Description</th>
                <th style={{width: '20%'}}>Path</th>
                <th style={{width: '10%'}}>Active</th>
                <th style={{width: '25%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((f, i) => (
                  <tr key={f.id}>
                    <td>{i + 1}</td>
                    <td>{f.title}</td>
                    <td>{f.description}</td>
                    <td>{f.path}</td>
                    <td className="text-center">
                      <Badge bg={f.is_active ? "success" : "secondary"}>
                        {f.is_active ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="text-center" style={{ whiteSpace: "nowrap" }}>
                      <Button size="sm" variant="primary" className="me-2" onClick={() => handleEdit(f)}>
                        Edit
                      </Button>
                      <Button
                        variant={f.is_active ? "warning" : "success"}
                            size="sm"
                            className="me-2 mb-1 mb-md-0"
                            onClick={() => toggleActive(f)}
                                            >
                       {f.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(f.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    No folders found.
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

export default LocalStorageFolderManager;
