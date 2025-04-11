import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for DocumentLayout
interface DocumentLayoutAttributes {
    id?: number;
    name: string;
    description?: string;
    fields: string;
    document_type?: number;
    document_width: number;
    document_height: number;
    created_by?: number;
}

// Define the creation attributes (optional fields during creation)
type DocumentLayoutCreationAttributes = Optional<DocumentLayoutAttributes, "id">

// Extend the Sequelize Model
class DocumentLayout extends Model<DocumentLayoutAttributes, DocumentLayoutCreationAttributes>
    implements DocumentLayoutAttributes {
    public id!: number;
    public name!: string;
    public description?: string;
    public fields!: string;
    public document_type?: number;
    public document_width!: number;
    public document_height!: number;
    public created_by?: number;
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
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            fields: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            document_type: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            document_width: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            document_height: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            created_by: {
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