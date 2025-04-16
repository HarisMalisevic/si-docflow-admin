import { useEffect, useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import Annotation, { AnnotationProps } from "./Annotation";
import { Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// @ts-ignore
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.1.91/build/pdf.worker.mjs';



function DocumentLayoutCreate() {
  const [annotations, setAnnotations] = useState<AnnotationProps[]>([]);
  const [newAnnotation, setNewAnnotation] = useState<AnnotationProps[]>([]);
  const [fieldName, setFieldName] = useState("");
  const [layoutName, setLayoutName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error message
  const [documentType, setDocumentType] = useState<number | null>(null); // State for document type
  const [uploadError, setUploadError] = useState<string | null>(null); // State for upload error
  const [layoutNameError, setLayoutNameError] = useState<string | null>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  type CanvasMeasures = {
    width: number;
    height: number;
  };

  type DocumentType = {
    id: number;
    name: string;
    description?: string;
    created_by?: number;
  }

  const [canvasMeasures, setCanvasMeasures] = useState<CanvasMeasures>({
    width: window.innerWidth / 2,
    height: window.innerHeight,
  });

  const getDocumentTypes = async () => {
    try{
      const response = await fetch("/api/document-types");
      const data = await response.json();
      setDocumentTypes(data);
    } catch (error) {
      console.error("Error while fetching document types: ", error);
    }
  }

  const handleMouseDown = (event: any) => {   //to start drawing when the mouse is pressed
    if (editingIndex !== null) return;
    
    if (annotations.length > 0 && !annotations[annotations.length - 1].saved) {  //remove the last drawn annotation if not saved
      annotations.pop();
    }

    const { x, y } = event.target.getStage().getPointerPosition();
    setNewAnnotation([{
      shapeProps: { x, y, width: 0, height: 0 },
      saved: false,
      isSelected: false,
      onChange: () => {}
    }]);
  };

  const handleMouseMove = (event: any) => { //to update the rectangle's dimensions as the mouse moves
    if (editingIndex !== null) return;
    
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].shapeProps.x; // start x
      const sy = newAnnotation[0].shapeProps.y; // start y
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([{
        shapeProps: { x: sx, y: sy, width: x - sx, height: y - sy },
        saved: false,
        isSelected: false,
        onChange: () => {}
      }]);
    }
  };

  const handleMouseUp = () => {     //to finalize the rectangle when the mouse is released
    if (editingIndex !== null) return;
    
    if (newAnnotation.length === 1) {
      setAnnotations((prev) => [...prev, ...newAnnotation]); // Save the annotation to the state
      setNewAnnotation([]); // Reset newAnnotation state
      console.log(newAnnotation);
      setEditingIndex(null);
    }
  };

  const saveAnnotation = () => {
    if (!fieldName.trim()) {
      setErrorMessage("Please enter a field name before saving.");
      return;
    }

    if (editingIndex !== null) {
      // Update the existing annotation
      console.log("Editing index: ", editingIndex);

      const updatedAnnotations = [...annotations];
      updatedAnnotations[editingIndex] = {
        ...updatedAnnotations[editingIndex],
        shapeProps: {
          ...updatedAnnotations[editingIndex].shapeProps,
          stroke: "blue",
        },
        saved: true,
        name: fieldName,
      };
      setAnnotations(updatedAnnotations);
      setEditingIndex(null); 
      setFieldName("");
      setErrorMessage(null); 
    } 
    else {
      if (annotations.length > 0 && !annotations[annotations.length - 1].saved) {
        const updatedAnnotations = [...annotations];
        updatedAnnotations[updatedAnnotations.length - 1] = {
          ...updatedAnnotations[updatedAnnotations.length - 1],
          shapeProps: {
            ...updatedAnnotations[updatedAnnotations.length - 1].shapeProps,
            stroke: "blue",
          },
          saved: true,
          name: fieldName,
        };
  
        setFieldName("");
        setAnnotations(updatedAnnotations);
        setErrorMessage(null); // Clear the error message
      } else {
        setErrorMessage("Please create an annotation before saving.");
      }
    }
  };

  const clearAll = () => {
    setAnnotations([]);
    setFieldName("");
    setLayoutNameError(null);
    setUploadError(null);
    setErrorMessage(null);
  }

  const editAnotation = (index: number) => {
    const annotationToEdit = annotations[index];
    setFieldName(annotationToEdit.name || ""); 
    setEditingIndex(index); 

    console.log("Editing index: ", editingIndex);

    annotationToEdit.saved = false;
    annotationToEdit.shapeProps.stroke = "red";

    console.log("Saved: ", annotationToEdit.saved);
    console.log("Is selected: ", annotationToEdit.isSelected);

    // Ja sam ovdje samo stavila da se mijenja naziv annotationa, a ti dodaj za mijenjanje pozicija annotationa
  };

  const showLayoutForm = () => {
    if (annotations.length === 0 || (annotations.length === 1 && !annotations[annotations.length - 1].saved)) {
      setErrorMessage("Please add at least one annotation before saving the layout.");
      setLayoutNameError(null);
      return;
    }

    if (!documentType) {
      setUploadError("Please select a valid document type before saving the layout.");
      return;
    }

    if (!showModal) {
      setShowModal(true);
      setLayoutNameError(null);
      setUploadError(null);
    }
  }

  const reset = () => {
    //remove the uploaded image and previous annotations, reset canvas
    setImage(null);
    setAnnotations([]);
    setNewAnnotation([]);
    setCanvasMeasures({
      width: window.innerWidth / 2,
      height: window.innerHeight,
    });
    setDocumentType(null);
    setLayoutName("");
    setShowModal(false);
    setLayoutNameError(null);
    setUploadError(null);
    setErrorMessage(null);
    setEditingIndex(null);
  }

  const saveLayout = async () => {    
    if (!layoutName.trim()) {
      setLayoutNameError("Please enter a layout name before saving.");
      return;
    }
    setLayoutNameError(null);

    try {
      if (annotations.length > 0 && !annotations[annotations.length - 1].saved) {  //remove the last drawn annotation if not saved
        annotations.pop();
      }

      let annotationsFields = annotations.map((annotation) => {
        return {
          name: annotation.name,
          upper_left: [annotation.shapeProps.x, annotation.shapeProps.y],
          lower_right: [annotation.shapeProps.x + annotation.shapeProps.width, annotation.shapeProps.y + annotation.shapeProps.height],
        };
      });

      let fields = JSON.stringify(annotationsFields);   //stringified annotations
      
      //==============ZA SLANJE U BAZU ==============//
      const response = await fetch("/api/document-layouts", {   //check if the route is correct, should be this one
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent with the request
        body: JSON.stringify({
          name: layoutName,
          fields: fields,
          image_width: canvasMeasures.width,
          image_height: canvasMeasures.height,
          document_type: documentType,
        }),
      });

      if(response.ok) {
        window.alert("Layout has been successfully saved!");
        reset();
      } 
      else {
        window.alert("Failed to save layout!");
        console.error("Failed to save layout");
      }
    } catch (error) {
      console.error("Error while saving layout: ", error);
    }

    setEditingIndex(null);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!documentType) {
      setUploadError("Please select a document type before uploading.");
      return;
    }

    const fileInput = e.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    setUploadError(null); // Clear the error if the document type is selected

    if (file.type === 'application/pdf') {
      const img = await renderFirstPage(file);  //the application expects single-page PDFs, which will be displayed as images
      setImage(img);

      const maxWidth = window.innerWidth / 2;
      const scale = Math.min(maxWidth / img.width, 1);

      setCanvasMeasures({
        width: img.width * scale,
        height: img.height * scale,
      });

      setAnnotations([]);
      setNewAnnotation([]);
    }
    else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result as string;  //the result is available via reader.result after reader.readAsDataURL is done
        img.onload = () => {
          const maxWidth = window.innerWidth / 2;
          const scale = Math.min(maxWidth / img.width, 1);

          setImage(img);
          setCanvasMeasures({             //scale the canvas
            width: img.width * scale,
            height: img.height * scale
          });
          setAnnotations([]);
          setNewAnnotation([]);
        }
      };
      reader.readAsDataURL(file); //tells the FileReader to start reading the file you selected
      //and convert it to Base64-encoded URL string (data URL)
    }
    fileInput.value = "";
    setLayoutName("");
    setShowModal(false);
  }

  async function renderFirstPage(file: File): Promise<HTMLImageElement> {   //
    const arrayBuffer = await file.arrayBuffer();     //converts file to binary data
    const pdf = await getDocument({ data: arrayBuffer }).promise;   //loads and parses the document
    const page = await pdf.getPage(1);      //returns the first page

    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement('canvas');    //dynamically creates a canvas to draw onto
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({         //draw the page on the canvas
      canvasContext: context!,
      viewport,
    }).promise;

    //convert canvas to image
    const img = new window.Image();
    img.src = canvas.toDataURL();
    await new Promise((resolve) => (img.onload = resolve));

    return img;   //this can now be used inside <Image> in react-konva
  }

  const annotationsToDraw = [...annotations, ...newAnnotation];

  useEffect(() => {
    getDocumentTypes();
  }, []);

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="document-type">
            <Form.Label style={{ marginLeft: "50px" }}>Select Document Type</Form.Label>
            <Form.Control
              as="select"
              disabled={image != null}
              onChange={(e) => setDocumentType(e.target.value ? Number(e.target.value) : null)}   //e.target.value is always a string
              value={documentType ?? ""}
              style={{ width: "200px", marginLeft: "50px" }}
            >
              <option value="">Select Type</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          {!image && (<Form.Group controlId="file-upload" className="mt-3">
            <Form.Label htmlFor="file-upload-input" style={{ cursor: "pointer", marginLeft: "50px" }}>
              <Button
                as="span"
                variant="primary"
                disabled={!documentType}
                onClick={(e) => {
                  if (!documentType) {
                    setUploadError("Please select a document type before uploading.");
                    e.preventDefault(); // Prevent the file input from being triggered
                  }
                }}
              >
                Upload File
              </Button>
            </Form.Label>
            <Form.Control
              id="file-upload-input"
              type="file"
              accept="image/*, application/pdf"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            {/* Display error message next to the button */}
            {uploadError && (
              <div className="text-danger mt-2" style={{ marginLeft: "50px" }}>
                {uploadError}
              </div>
            )}
          </Form.Group>)}
          {image && (<Button
            as="span"
            variant="secondary"
            style={{ marginLeft: "50px", marginTop: "15px" }}
            onClick={() => {
              const confirmReset = window.confirm("Are you sure you want to discard the unsaved layout?");
              if (confirmReset) reset();
              else return;
            }}
          >
            Reset
          </Button>)}
        </Col>
      </Row>
      {image &&
        <Row className="d-flex flex-wrap justify-content-center align-items-start">
          {/* Canvas Column */}
          <Col
            md={7}
            className="responsive-col"
            style={{
              marginLeft: "50px",
              minWidth: `${canvasMeasures.width}px`,
            }}
          >
            <div
              style={{
                border: "2px solid #000", // Add a border around the canvas
                borderRadius: "5px", // Optional: Add rounded corners
                padding: "10px", // Optional: Add padding inside the border
                backgroundColor: "#f8f9fa", // Optional: Add a light background color
                display: "inline-block", // Ensure the border wraps tightly around the canvas
              }}
            >
              <Stage
                width={canvasMeasures.width}
                height={canvasMeasures.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <Layer>
                  {image && (
                    <Image
                      image={image}
                      x={0}
                      y={0}
                      width={canvasMeasures.width}
                      height={canvasMeasures.height}
                    />
                  )}
                  {annotationsToDraw.map((annotation, i) => (
                    <Annotation
                      key={i}
                      {...annotation}
                      isSelected={editingIndex === i}
                      onChange={(newAttrs) => {
                        const updatedAnnotations = [...annotations];
                        updatedAnnotations[i] = {
                          ...updatedAnnotations[i],
                          shapeProps: newAttrs
                        };
                        setAnnotations(updatedAnnotations);
                      }}
                    />
                  ))}
                </Layer>
              </Stage>
            </div>
          </Col>

          {/* Form Column */}
          <Col
            md={5}
            className="responsive-col mx-auto"
            style={{ width: "550px"}}
          >
            <div className="mt-3">
              <Button variant="success" onClick={showLayoutForm}  className="me-2">Save Layout</Button>
              <Button 
                variant="danger" 
                onClick={()=>{
                  const confirmReset = window.confirm("Are you sure you want to delete all saved fields?");
                  if (confirmReset) clearAll();
                  else return;
                }}
              >
                Clear All
              </Button>

            </div>

            <div id="fieldForm">
              <h4 style={{ marginTop: "30px" }}>Field Properties</h4>
              <Form onSubmit={(e) => e.preventDefault()}>
                <Form.Group as={Row} controlId="fieldName" className="align-items-center">
                  <Col xs={8}>
                    <Form.Label>Field Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter field name"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                    />
                  </Col>
                  <Col xs={4}>
                    <Button
                      variant="primary"
                      onClick={saveAnnotation}
                      className="mt-4"
                    >
                      {editingIndex !== null ? "Update Field" : "Save Field"}
                    </Button>
                  </Col>
                </Form.Group>
              </Form>
              {errorMessage && (
                <div className="text-danger mt-2">{errorMessage}</div>
              )}
              {annotations.filter((annotation) => annotation.saved).length > 0 && (
                <div className="mt-3">
                  <h5>Added Fields:</h5>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Field Name</th>
                        <th>Field Coordinates</th>
                        <th style={{ borderRight: "none" }}> Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annotations
                        .filter((annotation) => annotation.saved)
                        .map((annotation, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{annotation.name || "Unnamed Field"}</td>
                            <td>
                            ({Number(annotation.shapeProps.x.toFixed(2))}, {Number(annotation.shapeProps.y.toFixed(2))}),  
                            ({Number(annotation.shapeProps.x.toFixed(2)) + Number(annotation.shapeProps.width.toFixed(2))}, {Number(annotation.shapeProps.y.toFixed(2))}) <br />
                            ({Number(annotation.shapeProps.x.toFixed(2))}, {Number(annotation.shapeProps.y.toFixed(2)) + Number(annotation.shapeProps.height.toFixed(2))}), 
                            ({Number(annotation.shapeProps.x.toFixed(2)) + Number(annotation.shapeProps.width.toFixed(2))}, {Number(annotation.shapeProps.y.toFixed(2)) + Number(annotation.shapeProps.height.toFixed(2))})
                            </td>
                            <td style={{ display: "flex", flexDirection: "row" }}>
                            <Button 
                                variant="primary"
                                className="me-2"
                                size="sm"
                                style={{ width: "70px"}}
                                onClick={() => {
                                  editAnotation(index); 
                                }}
                              >
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                style={{ width: "70px"}}
                                onClick={() => {
                                  const updatedAnnotations = annotations.filter((_, i) => i !== index);
                                  setAnnotations(updatedAnnotations);
                                }}
                              >
                                Delete
                            </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Save Layout</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={(e) => e.preventDefault()}>
                  <Form.Group controlId="layoutName">
                    <Form.Label>Layout Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter layout name"
                      value={layoutName}
                      onChange={(e) => setLayoutName(e.target.value)}
                    />
                  </Form.Group>
                </Form>
                {layoutNameError && (
                  <div className="text-danger mt-2">{layoutNameError}</div>
                )}
                <Button 
                  style={{ marginTop: "20px" }} 
                  variant="success" 
                  onClick={() => {
                    saveLayout();
                  }}
                  className="me-2"
                  >
                    Save Layout
                  </Button>
              </Modal.Body>
            </Modal>

          </Col>
        </Row>
      }
    </Container>
  );
}

export default DocumentLayoutCreate;