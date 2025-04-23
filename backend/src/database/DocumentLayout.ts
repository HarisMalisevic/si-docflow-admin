import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for DocumentLayout
interface DocumentLayoutAttributes {
    id: number;
    name: string; // Redundant field, can be removed if not needed
    fields: string;
    image_id: number;
    created_by?: number;
    updated_by?: number;
}

// Define the creation attributes (optional fields during creation)
type DocumentLayoutCreationAttributes = Optional<DocumentLayoutAttributes, "id">

// Extend the Sequelize Model
class DocumentLayout extends Model<DocumentLayoutAttributes, DocumentLayoutCreationAttributes>
    implements DocumentLayoutAttributes {
    public id!: number;
    public name!: string; // Redundant field, can be removed if not needed
    public fields!: string;
    public image_id!: number;
    public created_by?: number;
    public updated_by?: number;
}

// Initialize the model
export function initDocumentLayout(sequelize: Sequelize): typeof DocumentLayout {
    DocumentLayout.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: { // Redundant field, can be removed if not needed
                type: DataTypes.TEXT,
                allowNull: false,
            },
            fields: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            image_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
            },
            created_by: {
                type: DataTypes.INTEGER
            },
            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "DocumentLayout",
            tableName: "document_layouts",
            freezeTableName: true,
        }
    );

    return DocumentLayout;
}

export default DocumentLayout;