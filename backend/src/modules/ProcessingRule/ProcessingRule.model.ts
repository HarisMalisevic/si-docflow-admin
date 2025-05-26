import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import DocumentType from "../DocumentType/DocumentType.model"; // Assuming DocumentType is defined in the same directory

// Define the attributes for the ProcessingRule model
interface ProcessingRuleAttributes {
    id: number;
    title: string;
    description: string | null;
    document_type_id: number;
    is_active: boolean;
    created_by: number;
    updated_by?: number; // Assuming this field is optional
}

// Define the creation attributes (optional fields for new instances)
type ProcessingRuleCreationAttributes = Optional<ProcessingRuleAttributes, "id">;

// Define the ProcessingRule model class
class ProcessingRule extends Model<ProcessingRuleAttributes, ProcessingRuleCreationAttributes> implements ProcessingRuleAttributes {
    public id!: number;
    public title!: string;
    public description!: string | null;
    public document_type_id!: number;
    public is_active!: boolean;
    public created_by!: number;
    public updated_by?: number; // Assuming this field is optional
}

export function initProcessingRule(sequelize: Sequelize) {
    ProcessingRule.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            document_type_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: DocumentType,
                    key: "id",
                },
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            updated_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "ProcessingRule",
            tableName: "processing_rules",
            timestamps: true,
        }
    );

    return ProcessingRule;
}

export default ProcessingRule;