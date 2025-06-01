import { DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import DocumentType from "../DocumentType/DocumentType.model";
import AIProvider from "../AIProvider/AIProvider.model";

// Define the attributes for the ProcessingRequestsBillingLog model
interface ProcessingRequestsBillingLogAttributes {
    id: number;
    document_type_id: number;
    ai_provider_id: number;
    price: number;
}

// Define the creation attributes (optional fields for new instances)
export type ProcessingRequestsBillingLogCreationAttributes = Optional<ProcessingRequestsBillingLogAttributes, "id">;

// Define the ProcessingRequestsBillingLog model class
class ProcessingRequestsBillingLog extends Model<ProcessingRequestsBillingLogAttributes, ProcessingRequestsBillingLogCreationAttributes> implements ProcessingRequestsBillingLogAttributes {
    public id!: number;
    public document_type_id!: ForeignKey<DocumentType["id"]>;
    public ai_provider_id!: ForeignKey<AIProvider["id"]>;;
    public price!: number;
}

export function initProcessingRequestsBillingLog(sequelize: Sequelize) {
    ProcessingRequestsBillingLog.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            document_type_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: DocumentType,
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            ai_provider_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: AIProvider,
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            price: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "ProcessingRequestsBillingLog",
            tableName: "processing_requests_billing_logs",
            freezeTableName: true,
        }
    );

    return ProcessingRequestsBillingLog;
}

export default ProcessingRequestsBillingLog;