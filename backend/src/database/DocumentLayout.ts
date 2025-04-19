import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for DocumentLayout
interface DocumentLayoutAttributes {
    id: number;
    name: string;
    fields: string;
    document_type?: number;
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
    public name!: string;
    public fields!: string;
    public document_type?: number;
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
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            fields: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            document_type: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            image_id: {
                type: DataTypes.INTEGER,
                allowNull: true, // PREPROD: FALSE
                unique: false, // PREPROD: TRUE
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
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