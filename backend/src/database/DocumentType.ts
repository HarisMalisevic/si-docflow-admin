import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for the DocumentType model
interface DocumentTypeAttributes {
    id: number;
    name: string;
    description?: string;
    created_by?: number;
}

// Define the creation attributes (optional fields for new instances)
type DocumentTypeCreationAttributes = Optional<DocumentTypeAttributes, "id">;

// Define the DocumentType model class
class DocumentType extends Model<DocumentTypeAttributes, DocumentTypeCreationAttributes> implements DocumentTypeAttributes {
    public id!: number;
    public name!: string;
    public description?: string;
    public created_by?: number;
}

export default function initializeDocumentType(sequelize: Sequelize) {
    DocumentType.init(
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
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "DocumentType",
            tableName: "document_types",
            freezeTableName: true,
        }
    );

    return DocumentType;
}

export { DocumentType };