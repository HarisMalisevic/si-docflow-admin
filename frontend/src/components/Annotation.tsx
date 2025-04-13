import { Rect } from "react-konva";

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
};

// Annotation component
function Annotation(annotationProps: AnnotationProps) {
    return (
        <Rect
            fill="transparent"
            stroke={annotationProps.shapeProps.stroke || "red"}
            {...annotationProps.shapeProps}     //spread only the shapeProps object, not the whole annotationProps because of <Rect>                                               
        />
    );
}

export default Annotation;
