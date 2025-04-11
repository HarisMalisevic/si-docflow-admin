import { useEffect, useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import Annotation, { AnnotationProps } from "./Annotation";
import { ShapeProps } from "./Annotation";
import { Button } from "react-bootstrap";

function DocumentLayoutCreate() {
    const [annotations, setAnnotations] = useState<AnnotationProps[]>([]);
    const [newAnnotation, setNewAnnotation] = useState<AnnotationProps[]>([]);

    type CanvasMeasures = {
        width: number;
        height: number;
    };

    const [canvasMeasures, setCanvasMeasures] = useState<CanvasMeasures>({
        width: window.innerWidth,
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
      updatedAnnotations[updatedAnnotations.length - 1].shapeProps.stroke = "blue";
      updatedAnnotations[updatedAnnotations.length - 1].saved = true;
      
      setAnnotations(updatedAnnotations);
    }
    
    const annotationsToDraw = [...annotations, ...newAnnotation];
    
    return (
        <div tabIndex={1}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
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
            }}
          />

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
          <Button
            variant="light"
            onClick={saveAnnotation}
          >
            Save
          </Button>
        </div>
    );  
}

export default DocumentLayoutCreate;