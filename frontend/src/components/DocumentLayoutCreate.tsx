import { useEffect, useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import Annotation, { AnnotationProps } from "./Annotation";
import { ShapeProps } from "./Annotation";
import { Button, Form } from "react-bootstrap";

function DocumentLayoutCreate() {
    const [annotations, setAnnotations] = useState<AnnotationProps[]>([]);
    const [newAnnotation, setNewAnnotation] = useState<AnnotationProps[]>([]);
    const [fieldName, setFieldName] = useState("");

    type CanvasMeasures = {
        width: number;
        height: number;
    };

    const [canvasMeasures, setCanvasMeasures] = useState<CanvasMeasures>({
        width: window.innerWidth / 2,
        height: window.innerHeight,
    });

    const handleMouseDown = (event: any) => {   //to start drawing when the mouse is pressed
        if(annotations.length > 0 && !annotations[annotations.length - 1].saved) {  //remove the last drawn annotation if not saved
          annotations.pop();
        }

        const { x, y } = event.target.getStage().getPointerPosition();
        setNewAnnotation([{ 
          shapeProps: { x, y, width: 0, height: 0 }, 
          saved: false
        }]);
    };

    const [image, setImage] = useState<HTMLImageElement | null>(null);
      
    const handleMouseMove = (event: any) => { //to update the rectangle's dimensions as the mouse moves
    if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].shapeProps.x; // start x
        const sy = newAnnotation[0].shapeProps.y; // start y
        const { x, y } = event.target.getStage().getPointerPosition();
        setNewAnnotation([{
          shapeProps: { x: sx, y: sy, width: x - sx, height: y - sy },
          saved: false
        }]);
    }
    };
    
    const handleMouseUp = () => {     //to finalize the rectangle when the mouse is released
    if (newAnnotation.length === 1) {
        setAnnotations((prev) => [...prev, ...newAnnotation]); // Save the annotation to the state
        setNewAnnotation([]); // Reset newAnnotation state
    }
    };

    const saveAnnotation = () => {
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
    }

    const clearAll = () => {
      setAnnotations([]);
    }

    const saveLayout = async () => {
      try {
        if(annotations.length > 0 && !annotations[annotations.length - 1].saved) {  //remove the last drawn annotation if not saved
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

        console.log(annotationsFields);
        console.log(fields);

        //for testing purposes, should only be in the if(response.ok) block
        setImage(null);
        setAnnotations([]);
        setNewAnnotation([]);
        setCanvasMeasures({
          width: window.innerWidth / 2,
          height: window.innerHeight,
        });
        //

        /*const response = await fetch("/api/document-layouts", {   //should be this route
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              //name - user should input before saving the layout
              //fields - done
              //document_type - user should choose when uploading a file
              //image_width, image_height - canvas measures
          }),
        });

        if(response.ok) {
          //remove the uploaded image and previous annotations, reset canvas
          setImage(null);
          setAnnotations([]);
          setNewAnnotation([]);
          setCanvasMeasures({
            width: window.innerWidth / 2,
            height: window.innerHeight,
          });
        } 
        else {
          console.error("Failed to save layout");
        }*/
      } catch (error) {
        console.error("Error while saving layout: ", error);
      }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result as string;  //the result is available via reader.result after reader.readAsDataURL is done
        img.onload = () => {
          const maxWidth = window.innerWidth / 2;
          const scale = Math.min(maxWidth / img.width, 1);

          setImage(img);
          setCanvasMeasures({             //scale the canvas (and the image)
            width: img.width * scale, 
            height: img.height * scale 
          });
          setAnnotations([]);
          setNewAnnotation([]);
        }
      };
      reader.readAsDataURL(file); //tells the FileReader to start reading the file you selected
                                  //and convert it to Base64-encoded URL string (data URL)
      fileInput.value = "";
    }
    
    const annotationsToDraw = [...annotations, ...newAnnotation];
    
    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div id="fileDisplay">
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
                    x={0} // Set image position on canvas
                    y={0}
                    width={canvasMeasures.width} // Adjust image size to fill the canvas
                    height={canvasMeasures.height}
                  />
                )}
                {annotationsToDraw.map((annotation, i) => {
                  return (
                    <Annotation
                      key={i}
                      {...annotation}
                    />
                  );
                })}
              </Layer>
            </Stage>
          </div>         

          <div id="buttonsAndForms">
            <div id="buttons" style={{ marginBottom: "30px", display: "flex", flexDirection: "row" }}>
              <Form.Group controlId="file-upload">
                <Form.Label htmlFor="file-upload-input" style={{ cursor: "pointer" }}>
                  <Button as="span" variant="primary">Upload Image</Button>
                </Form.Label>

                <Form.Control
                  id="file-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={ handleFileUpload }
                />
              </Form.Group>

              <Button
                variant="primary"
                onClick={ saveLayout }
              >
                Save Layout
              </Button>

              <Button
                variant="danger"
                onClick={ clearAll }
              >
                Clear All
              </Button>
            </div>
            
            <h4>Field Properties</h4>
            <Form>
              <Form.Group controlId="fieldName">
                <Form.Label>Field Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter field name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                />
              </Form.Group>
              <br></br>
              <Button variant="primary" type="button"onClick={ saveAnnotation }>
                  Save Field
              </Button>
            </Form>
          </div> 
        </div>
    );  
}

export default DocumentLayoutCreate;