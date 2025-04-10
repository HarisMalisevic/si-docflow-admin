import { useEffect, useState } from "react";
import { Stage, Layer, Image } from "react-konva";
import Annotation from "./Annotation";
import { ShapeProps } from "./Annotation";
import { Button } from "react-bootstrap";

function DocumentLayoutCreate() {
    const [annotations, setAnnotations] = useState<ShapeProps[]>([]);
    const [newAnnotation, setNewAnnotation] = useState<ShapeProps[]>([]);

    type CanvasMeasures = {
        width: number;
        height: number;
    };

    const [canvasMeasures, setCanvasMeasures] = useState<CanvasMeasures>({
        width: window.innerWidth / 2,
        height: window.innerHeight,
    });

    const handleMouseDown = (event: any) => {   //to start drawing when the mouse is pressed
        if(annotations.length > 0 && annotations[annotations.length - 1].stroke != "blue") {
          annotations.pop();
        }

        const { x, y } = event.target.getStage().getPointerPosition();
        setNewAnnotation([{ x, y, width: 0, height: 0}]);
    };

    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = "https://cdn.dribbble.com/users/2150390/screenshots/8064018/media/117406b607c400e7030deb6dfa60caa6.jpg";
        img.onload = () => setImage(img);
    }, []);
      
    const handleMouseMove = (event: any) => { //to update the rectangle's dimensions as the mouse moves
    if (newAnnotation.length === 1) {
        const sx = newAnnotation[0].x; // start x
        const sy = newAnnotation[0].y; // start y
        const { x, y } = event.target.getStage().getPointerPosition();
        setNewAnnotation([
        {
            x: sx,
            y: sy,
            width: x - sx,
            height: y - sy
        },
        ]);
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
      updatedAnnotations[updatedAnnotations.length - 1].stroke = "blue";
      
      setAnnotations(updatedAnnotations);
    }
    
    const annotationsToDraw = [...annotations, ...newAnnotation];
    
    return (
        <div tabIndex={1}>
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
                    shapeProps={annotation}
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