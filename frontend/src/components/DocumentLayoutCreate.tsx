import { useEffect, useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import { Annotation, AnnotationProps, instanceHandleMouseDown, instanceHandleMouseMove, instanceHandleMouseUp, instanceSaveAnnotation, instanceEditAnotation } from "./Annotation";
import { Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { useNavigate } from "react-router-dom";
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
  const [canvasMeasures, setCanvasMeasures] = useState<CanvasMeasures>({
    width: window.innerWidth / 2,
    height: window.innerHeight,
  });
  const annotationsToDraw = [...annotations, ...newAnnotation];
  const [waitingForSave, setWaitingForSave] = useState(false);

  const navigate = useNavigate();

  type CanvasMeasures = {
    width: number;
    height: number;
  };

  type DocumentType = {
    id: number;
    name: string;
    description?: string;
    document_layout_id?: number;
    created_by?: number;
  }

  function imageToBlob(imgElement: HTMLImageElement): Promise<Blob> {

    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      const canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;
      canvasContext.drawImage(imgElement, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to convert image to Blob");
        }
        resolve(blob);
      }, "image/png"); // Blol je PNG!
    });
  }


  async function postDocumentLayout(layoutName: string, fields: string, document_type: number, image_width: number, image_height: number, image: HTMLImageElement) {

    try {

      const blob = await imageToBlob(image); // image is your HTMLImageElement

      const formData = new FormData();
      formData.append("image", blob, `${layoutName}.png`); // name it as a file

      formData.append("metadata", JSON.stringify({
        name: layoutName,
        fields: fields,
        document_type: documentType,
        image_width: canvasMeasures.width,
        image_height: canvasMeasures.height
      }));

      //==============ZA SLANJE U BAZU ==============//
      const response = await fetch("/api/document-layouts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        window.alert("Layout has been successfully saved!");
        setShowModal(false);
        navigate("/document-layouts");
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

  const getDocumentTypes = async () => {
    try {
      const response = await fetch("/api/document-types");
      const data = await response.json();
      let filteredData: DocumentType[] = data.filter((type: DocumentType) => type.document_layout_id === null);
      setDocumentTypes(filteredData);
    } catch (error) {
      console.error("Error while fetching document types: ", error);
    }
  }

  const handleMouseDown = (event: any) => {   //to start drawing when the mouse is pressed
    if (editingIndex !== null) return;
    
    if (annotations.length > 0 && !annotations[annotations.length - 1].saved) {  //remove the last drawn annotation if not saved
      annotations.pop();
    }

    const res = instanceHandleMouseDown(event);
    setNewAnnotation(res);
  };

  const [layoutPreviewImage, setImage] = useState<HTMLImageElement | null>(null);

  const handleMouseMove = (event: any) => { //to update the rectangle's dimensions as the mouse moves
    if (editingIndex !== null) return;
    
    if (newAnnotation.length === 1) {
      const res = instanceHandleMouseMove(event, newAnnotation);
      setNewAnnotation(res);
    }
  };

  const handleMouseUp = () => {     //to finalize the rectangle when the mouse is released
    if (editingIndex !== null) return;
    
    if (newAnnotation.length === 1) {
      const res = instanceHandleMouseUp(newAnnotation, annotations);
      setAnnotations(res); 
      setNewAnnotation([]);
      setEditingIndex(null);
    }
  };

  const saveAnnotation = () => {
    if (!fieldName.trim()) {
      setErrorMessage("Please enter a field name before saving.");
      return;
    }

    const res = instanceSaveAnnotation(editingIndex, annotations, fieldName);
    if(res.length == 0) {
      setErrorMessage("Please create an annotation before saving.");
    }
    else {
      setAnnotations(res);
      setEditingIndex(null); 
      setFieldName("");
      setErrorMessage(null); 
    }
  };

  const clearAll = () => {
    setAnnotations([]);
    setNewAnnotation([]);
    setFieldName("");
    setLayoutNameError(null);
    setUploadError(null);
    setErrorMessage(null);
    setEditingIndex(null);
  }

  const editAnotation = (index: number) => {
    setEditingIndex(index); 
    const res = instanceEditAnotation(index, annotations);
    const annotationToEdit = res;
    setFieldName(annotationToEdit.name || ""); 
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

    //handle unsaved annotations
    const updatedAnnotations = [];

    for(let i = 0; i < annotations.length; i++) {
        if(annotations[i].saved) {
          updatedAnnotations.push(annotations[i]);    //only keep if saved
        }
    }

    let annotationsFields = updatedAnnotations.map((annotation) => {
      return {
        name: annotation.name,
        upper_left: [annotation.shapeProps.x, annotation.shapeProps.y],
        lower_right: [annotation.shapeProps.x + annotation.shapeProps.width, annotation.shapeProps.y + annotation.shapeProps.height],
      };
    });

    let fields = JSON.stringify(annotationsFields);   //stringified annotations

    if (!layoutPreviewImage) {
      setErrorMessage("Please upload an image before saving the layout.");
      return;
    }

    setWaitingForSave(true);
    postDocumentLayout(layoutName, fields, documentType!, canvasMeasures.width, canvasMeasures.height, layoutPreviewImage); //image is HTMLImageElement

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

  const roundToTwo = (x: number) => Math.round(x * 100) / 100

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
              disabled={layoutPreviewImage != null}
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
          {!layoutPreviewImage && (<Form.Group controlId="file-upload" className="mt-3">
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
          {layoutPreviewImage && (<Button
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
      {layoutPreviewImage &&
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
                  {layoutPreviewImage && (
                    <Image
                      image={layoutPreviewImage}
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
                        <th >Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annotations
                        .filter((annotation) => annotation.saved)
                        .map((annotation, index) => (
                          <tr key={index}>
                            <td className="text-start align-middle">{index + 1}</td>
                            <td className="text-start align-middle">{annotation.name || "Unnamed Field"}</td>
                            <td className="text-start align-middle">
                            ({roundToTwo(Number(annotation.shapeProps.x))}, {roundToTwo(Number(annotation.shapeProps.y))}),  
                            ({roundToTwo(Number(annotation.shapeProps.x) + Number(annotation.shapeProps.width))}, {roundToTwo(Number(annotation.shapeProps.y))}) <br />
                            ({roundToTwo(Number(annotation.shapeProps.x))}, {roundToTwo(Number(annotation.shapeProps.y) + Number(annotation.shapeProps.height))}), 
                            ({roundToTwo(Number(annotation.shapeProps.x) + Number(annotation.shapeProps.width))}, {roundToTwo(Number(annotation.shapeProps.y) + Number(annotation.shapeProps.height))})
                            </td>
                            <td className="text-center align-middle" style={{ whiteSpace: "nowrap" }}>
                            <Button 
                                variant="primary"
                                className="me-2"
                                size="sm"
                                style={{ width: "65px"}}
                                onClick={() => {
                                  editAnotation(index); 
                                }}
                                disabled={ editingIndex != null }
                              >
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                style={{ width: "65px"}}
                                onClick={() => {
                                  const updatedAnnotations = annotations.filter((_, i) => i !== index);
                                  setAnnotations(updatedAnnotations);
                                }}
                                disabled={ editingIndex != null }
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
                  disabled={waitingForSave}
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