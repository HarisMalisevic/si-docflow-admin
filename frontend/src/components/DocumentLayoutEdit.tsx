import { useEffect, useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import { Annotation, AnnotationProps, instanceHandleMouseDown, instanceHandleMouseMove, instanceHandleMouseUp, instanceSaveAnnotation, instanceEditAnotation } from "./Annotation";
import { Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// @ts-ignore
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.1.91/build/pdf.worker.mjs';

function DocumentLayoutEdit() {
    const { id } = useParams();

    const [annotations, setAnnotations] = useState<AnnotationProps[]>([]);
    const [newAnnotation, setNewAnnotation] = useState<AnnotationProps[]>([]);
    const [fieldName, setFieldName] = useState("");
    const [layoutName, setLayoutName] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [layoutNameError, setLayoutNameError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [canvasMeasures, setCanvasMeasures] = useState<CanvasMeasures>({
        width: window.innerWidth / 2,
        height: window.innerHeight,
    });
    const annotationsToDraw = [...annotations, ...newAnnotation];
    const [layoutPreviewImage, setImage] = useState<HTMLImageElement | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [changesMade, setChangesMade] = useState(false);
    const [initialAnnotations, setInitialAnnotations] = useState<AnnotationProps[]>([]);
    const [waitingForSave, setWaitingForSave] = useState(false);

    const navigate = useNavigate();

    type CanvasMeasures = {
        width: number;
        height: number;
    };

    const fetchDocumentLayout = async () => {
        try {
            const response = await fetch(`/api/document-layouts/${id}`);
            const data = await response.json();

            const fields = data.fields ? JSON.parse(data.fields) : [];

            let annotationsFields: AnnotationProps[] = fields.map((field: any) => {
                return {
                  name: field.name,
                  shapeProps: {
                    x: field.upper_left[0],
                    y: field.upper_left[1],
                    width: field.lower_right[0] - field.upper_left[0],
                    height: field.lower_right[1] - field.upper_left[1],
                    stroke: "blue",
                  },
                  saved: true,
                  isSelected: false,
                  onChange: () => {},
                  isMultiline: field.is_multiline,
                };
            });

            setAnnotations(annotationsFields);
            setInitialAnnotations(
                annotationsFields.map(field => ({
                  ...field,
                  shapeProps: { ...field.shapeProps },
                }))
            );              
            setLayoutName(data.name ? data.name : "");
        } catch (error) {
            console.error("Error fetching document layout: ", error);
        }
    };

    const fetchLayoutImage = async () => {
        try {
            const response = await fetch(`/api/document-layouts/${id}/image`);

            //must go before response.blob()
            const imageWidth = response.headers.get("X-Image-Width");
            const imageHeight = response.headers.get("X-Image-Height");

            setCanvasMeasures({
                width: Number(imageWidth),
                height: Number(imageHeight),
            });

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const img = new window.Image();
            img.src = url;

            img.onload = () => {    //ensures the image is fully loaded before calling setImage
                setImage(img);
                setImageUrl(url);
            };
        } catch (error) {
            console.error("Error fetching document layout: ", error);
        }
    };

    const handleMouseDown = (event: any) => {   //to start drawing when the mouse is pressed
        if (editingIndex !== null) return;
        
        if (annotations.length > 0 && !annotations[annotations.length - 1].saved) {  //remove the last drawn annotation if not saved
            annotations.pop();
        }

        const res = instanceHandleMouseDown(event);
        setNewAnnotation(res);
    };

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

    const areShapePropsEqual = (annotationsA: AnnotationProps[], annotationsB: AnnotationProps[]): boolean => {
        if (annotationsA.length !== annotationsB.length) {
          return false;
        }
      
        for (let i = 0; i < annotationsA.length; i++) {
          const aShape = annotationsA[i].shapeProps;
          const bShape = annotationsB[i].shapeProps;
      
          if (
            aShape.x !== bShape.x ||
            aShape.y !== bShape.y ||
            aShape.width !== bShape.width ||
            aShape.height !== bShape.height
          ) {
            return false;
          }
        }
      
        return true;
    }

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
          if(!changesMade){
            if (editingIndex !== null && initialAnnotations[editingIndex].name !== res[editingIndex].name) {
                setChangesMade(true);
            } else {
                setChangesMade(!areShapePropsEqual(initialAnnotations, res));
            }   
          }

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
        setErrorMessage(null);
        setEditingIndex(null);
        setChangesMade(true);
    }

    const editAnotation = (index: number) => {
        setEditingIndex(index); 
        if(annotations.length > 0 && !annotations[annotations.length - 1].saved) {
            annotations.pop();
        }
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
    
        if (!showModal) {
          setShowModal(true);
          setLayoutNameError(null);
        }
    }

    async function putDocumentLayout(layoutName: string, fields: string) {

        try {
          const updatedLayout = {
            name: layoutName,
            fields: fields,
          };
    
          //==============ZA SLANJE U BAZU ==============//
          const response = await fetch(`/api/document-layouts/${id}/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedLayout),
            credentials: "include",
          });
    
          if (response.ok) {
            window.alert("Layout has been successfully updated!");
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

    const saveLayout = async () => {
        if (!layoutName.trim()) {
          setLayoutNameError("Please enter a layout name before saving.");
          return;
        }
        setLayoutNameError(null);
        
        //handle unsaved annotations
        const updatedAnnotations = [];

        for(let i = 0; i < annotations.length; i++) {
            if(!annotations[i].saved) {
                if(editingIndex === i) {      
                    updatedAnnotations.push({
                        ...initialAnnotations[i],       //return to the last saved state (before editing)
                        shapeProps: { ...initialAnnotations[i].shapeProps }
                    });
                }
            }
            else {
                updatedAnnotations.push(annotations[i]);    //keep the annotation as is
            }
        }
    
        let annotationsFields = updatedAnnotations.map((annotation) => {
          return {
            name: annotation.name,
            upper_left: [annotation.shapeProps.x, annotation.shapeProps.y],
            lower_right: [annotation.shapeProps.x + annotation.shapeProps.width, annotation.shapeProps.y + annotation.shapeProps.height],
            is_multiline: annotation.isMultiline
          };
        });
    
        let fields = JSON.stringify(annotationsFields);   //stringified annotations
    
        if (!layoutPreviewImage) {
          setErrorMessage("Please upload an image before saving the layout.");
          return;
        }
        
        setWaitingForSave(true);
        putDocumentLayout(layoutName, fields);
    }

    const discardChanges = () => {
        setAnnotations(initialAnnotations);
        setChangesMade(false);
    };

    useEffect(() => {
        async function fetchData() {
            await fetchDocumentLayout();
            await fetchLayoutImage();
        }
        
        fetchData();

        return () => {
            if (imageUrl) {
              URL.revokeObjectURL(imageUrl);    //to revoke the temporary URL
            }
        };
    }, []);

    useEffect(() => {}, [annotations]);

    return (
        <Container fluid>
        {<Row className="mb-3">
            <Col>
                {changesMade && (<Button
                    as="span"
                    variant="secondary"
                    style={{ marginLeft: "50px", marginTop: "15px" }}
                    onClick={() => {
                        const confirmReset = window.confirm("Are you sure you want to discard all changes?");
                        if (confirmReset) discardChanges();
                        else return;
                    }}
                >
                    Discard Changes
                </Button>)}
            </Col>
        </Row>}
        {layoutPreviewImage &&
            <Row className="d-flex flex-wrap justify-content-center align-items-start">
            {/* Canvas Column */}
            <Col
                md={6}
                className="responsive-col"
                style={{
                marginLeft: "50px",
                minWidth: `${canvasMeasures.width}px`,
                marginRight: "30px",
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
                md={6}
                className="responsive-col mx-auto"
                style={{ width: "570px"}}
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
                    <Table striped bordered hover style={{ maxWidth: '570px' }}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Field Name</th>
                            <th>Field Coordinates</th>
                            <th>Actions</th>
                            <th>Multi-line</th>
                        </tr>
                        </thead>
                        <tbody>
                        {annotations
                            .filter((annotation) => annotation.saved)
                            .map((annotation, index) => (
                            <tr key={index}>
                                <td className="text-start align-middle">{index + 1}</td>
                                <td className="text-start align-middle" style={{ maxWidth: '180px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{annotation.name || "Unnamed Field"}</td>
                                <td className="text-start align-middle">
                                ({Math.round(Number(annotation.shapeProps.x))}, {Math.round(Number(annotation.shapeProps.y))}) <br />
                                ({Math.round(Number(annotation.shapeProps.x) + Number(annotation.shapeProps.width))}, {Math.round(Number(annotation.shapeProps.y))}) <br />
                                ({Math.round(Number(annotation.shapeProps.x))}, {Math.round(Number(annotation.shapeProps.y) + Number(annotation.shapeProps.height))}) <br />
                                ({Math.round(Number(annotation.shapeProps.x) + Number(annotation.shapeProps.width))}, {Math.round(Number(annotation.shapeProps.y) + Number(annotation.shapeProps.height))})
                                </td>
                                <td className="text-center align-middle" style={{ whiteSpace: "nowrap", padding: "0px 5px" }}>
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
                                        setChangesMade(true);
                                        const updatedAnnotations = annotations.filter((_, i) => i !== index);
                                        setAnnotations(updatedAnnotations);
                                    }}
                                    disabled={ editingIndex != null }
                                >
                                    Delete
                                </Button>
                                </td>
                                <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <Form.Check 
                                    type="checkbox"
                                    className="custom-checkbox"
                                    style={{ padding: "5px" }}
                                    checked={ annotation.isMultiline }
                                    onChange={() => {
                                        const updatedAnnotations = [...annotations];
                                        updatedAnnotations[index] = {
                                            ...updatedAnnotations[index],
                                            isMultiline: !updatedAnnotations[index].isMultiline
                                        };
                                        setAnnotations(updatedAnnotations);
                                        setChangesMade(true);
                                    }}
                                    disabled={ editingIndex != null } 
                                />
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

export default DocumentLayoutEdit;