import Konva from "konva";
import { useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";

// Define ShapeProps type
export type ShapeProps = { 
    x: number;
    y: number;
    width: number;
    height: number;
    stroke?: string;
};

// Define AnnotationProps type
export type AnnotationProps = {
    name?: string;
    shapeProps: ShapeProps;
    saved: boolean;
    isSelected?: boolean;
    onChange?: (newAttrs: ShapeProps) => void;
};

// Annotation component
export function Annotation(annotationProps: AnnotationProps) {
    const shapeRef = useRef<Konva.Rect>(null);  //points to the Rect rendered in the canvas
    const transformRef = useRef<Konva.Transformer>(null);   //points to the Transformer (the visual box with resize/rotate handles that appears when an annotation is selected)
    
    useEffect(() => {
        if (!annotationProps.saved && annotationProps.isSelected && transformRef.current && shapeRef.current) {
          transformRef.current.nodes([shapeRef.current]);   //Transformer is attached to the Rect
          transformRef.current.getLayer()?.batchDraw();     //a redraw is forced to update the canvas
        }
    }, [annotationProps.isSelected]);   //runs when the annotation is selected

    const onMouseEnter = (event: Konva.KonvaEventObject<MouseEvent>) => {
        if (!annotationProps.saved && annotationProps.name) {
            event.target.getStage()?.container().style.setProperty("cursor", "move");   //it can be dragged
          }   
    };

    const onMouseLeave = (event: Konva.KonvaEventObject<MouseEvent>) => {
        event.target.getStage()?.container().style.setProperty("cursor", "crosshair");  
    };

    return (
        <>
            <Rect
                fill="transparent"
                stroke={annotationProps.shapeProps.stroke || "red"}
                listening={!annotationProps.saved}
                ref={shapeRef}
                {...annotationProps.shapeProps}     //spread only the shapeProps object, not the whole annotationProps because of <Rect>                                               
                draggable={!annotationProps.saved}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onDragEnd={event => {           //when a rectangle is dragged and then the mouse is released
                    if(!annotationProps.saved && annotationProps.onChange){
                        annotationProps.onChange({
                            ...annotationProps.shapeProps,
                            x: event.target.x(),    //change the coordinates during dragging
                            y: event.target.y(),
                        });
                    }
                }}
                onTransformEnd={() => {         //when a rectangle is resized
                    const node = shapeRef.current;
                    if (!node || annotationProps.saved) return;

                    const scaleX = node.scaleX();   //Konva doesn't directly change the width and height of the shape, instead it scales it. The changes are saved afterwards.
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);

                    if(annotationProps.onChange){
                        annotationProps.onChange({
                            ...annotationProps.shapeProps,
                            x: node.x(),
                            y: node.y(),
                            width: node.width() * scaleX,       //width and height are also updated at the end
                            height: node.height() * scaleY,
                        });
                    }
                }}
            />
                {annotationProps.isSelected && !annotationProps.saved &&
                    <Transformer 
                        ref={transformRef} 
                        enabledAnchors={[
                            "top-left", "top-center", "top-right",
                            "middle-left", "middle-right",
                            "bottom-left", "bottom-center", "bottom-right"
                        ]}  
                        rotateEnabled={false}
                    />
                }
        </>
    );
}

export const instanceHandleMouseDown = (event: any) => {   //to start drawing when the mouse is pressed
    const { x, y } = event.target.getStage().getPointerPosition();
    return [{
        shapeProps: { x, y, width: 0, height: 0 },
        saved: false,
        isSelected: false,
        onChange: () => {}
    }];
};

export const instanceHandleMouseMove = (event: any, newAnnotation: AnnotationProps[]) => { //to update the rectangle's dimensions as the mouse moves    
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].shapeProps.x; // start x
      const sy = newAnnotation[0].shapeProps.y; // start y
      const { x, y } = event.target.getStage().getPointerPosition();
      return [{
        shapeProps: { x: sx, y: sy, width: x - sx, height: y - sy },
        saved: false,
        isSelected: false,
        onChange: () => {}
      }];
    }
    return [];
};

export const instanceHandleMouseUp = (newAnnotation: AnnotationProps[], annotations: AnnotationProps[]) => {     //to finalize the rectangle when the mouse is released    
    if (newAnnotation.length === 1) {
        return [...annotations, ...newAnnotation];
    }
    return [];
};

export const instanceSaveAnnotation = (editingIndex: number | null, annotations: AnnotationProps[], fieldName: string) => {
    if (editingIndex !== null) {
      // Update the existing annotation
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
      return updatedAnnotations; 
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
  
        return updatedAnnotations;
      } else {
        return [];
      }
    }
};

export const instanceEditAnotation = (index: number, annotations: AnnotationProps[]) => {
    const annotationToEdit = annotations[index];
    annotationToEdit.saved = false;
    annotationToEdit.shapeProps.stroke = "red";

    return annotationToEdit;
};
