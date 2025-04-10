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
    shapeProps: ShapeProps;
};

// Annotation component
function Annotation({ shapeProps }: AnnotationProps) {
    return (
        <Rect
            fill="transparent"
            stroke={shapeProps.stroke || "red"}
            {...shapeProps} // Spread the actual shapeProps object here
        />
    );
}

export default Annotation;
