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
function Annotation(annotationProps: AnnotationProps) {
    const shapeRef = useRef<Konva.Rect>(null);  //points to the Rect rendered in the canvas
    const transformRef = useRef<Konva.Transformer>(null);   //points to the Transformer (the visual box with resize/rotate handles that appears when an annotation is selected)
    
    useEffect(() => {
        if (!annotationProps.saved && annotationProps.isSelected && transformRef.current && shapeRef.current) {
          transformRef.current.nodes([shapeRef.current]);   //Transformer is attached to the Rect
          shapeRef.current?.moveToTop();
          transformRef.current?.getLayer()?.moveToTop();
          transformRef.current.getLayer()?.batchDraw();     //a redraw is forced to update the canvas

          console.log("Transformer attached to:", transformRef.current.nodes());
        }
    }, [annotationProps.isSelected]);   //runs when the annotation is selected

    const onMouseEnter = (event: Konva.KonvaEventObject<MouseEvent>) => {
        if (!annotationProps.saved) {
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
                hitStrokeWidth={6}
                listening={!annotationProps.saved}
                ref={shapeRef}
                {...annotationProps.shapeProps}     //spread only the shapeProps object, not the whole annotationProps because of <Rect>                                               
                draggable={!annotationProps.saved}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onDragEnd={event => {           //when a rectangle is dragged and then the mouse is released
                    if(!annotationProps.saved && annotationProps.onChange){
                        console.log(`Drag End - x: ${event.target.x()}, y: ${event.target.y()}`);

                        annotationProps.onChange({
                            ...annotationProps.shapeProps,
                            x: event.target.x(),    //change the coordinates during dragging
                            y: event.target.y(),
                        });
                    }

                    shapeRef.current?.moveToTop();
                    transformRef.current?.getLayer()?.moveToTop();

                    if(transformRef.current) transformRef.current.getLayer()?.batchDraw(); 
                }}
                onTransformEnd={() => {         //when a rectangle is resized
                    const node = shapeRef.current;
                    if (!node || annotationProps.saved) return;

                    console.log(`Drag End - x: ${node.x()}, y: ${node.y()}`);

                    const scaleX = node.scaleX();   //Konva doesn't directly change the width and height of the shape, instead it scales it
                                                    //therefore, the scaling is saved afterwards
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

                    shapeRef.current?.moveToTop();
                    transformRef.current?.getLayer()?.moveToTop();

                    if(transformRef.current) transformRef.current.getLayer()?.batchDraw(); 
                }}
            />
                {annotationProps.isSelected && !annotationProps.saved &&
                    <Transformer 
                        ref={transformRef} 
                        enabledAnchors={[
                            "top-left", "top-right",
                            "bottom-left", "bottom-right"
                        ]}
                        padding={2}       
                        anchorSize={10}    
                        rotateEnabled={false}
                    />
                }
        </>
    );
}

export default Annotation;
