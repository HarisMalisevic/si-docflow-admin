import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import ProcessingRule from "./ProcessingRule";
import LocalStorageFolder from "./LocalStorageFolder";
import ExternalAPIEndpoint from "./ExternalAPIEndpoint";
import ExternalFTPEndpoint from "./ExternalFTPEndpoint";

// Define the attributes for the ProcessingRuleDestination model
interface ProcessingRuleDestinationAttributes {
    id: number;
    processing_rule_id: number;
    local_storage_folder_id?: number | null;
    external_api_endpoint_id?: number | null;
    external_ftp_endpoint_id?: number | null;
    created_by: number;
    updated_by?: number;
}

// Define the creation attributes (optional fields for new instances)
type ProcessingRuleDestinationCreationAttributes = Optional<ProcessingRuleDestinationAttributes, "id">;

// Define the ProcessingRuleDestination model class
class ProcessingRuleDestination extends Model<ProcessingRuleDestinationAttributes, ProcessingRuleDestinationCreationAttributes> 
    implements ProcessingRuleDestinationAttributes {
    public id!: number;
    public processing_rule_id!: number;
    public local_storage_folder_id?: number | null;
    public external_api_endpoint_id?: number | null;
    public external_ftp_endpoint_id?: number | null;
    public created_by!: number;
    public updated_by?: number;
}

export function initProcessingRuleDestination(sequelize: Sequelize) {
    ProcessingRuleDestination.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            processing_rule_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: ProcessingRule,
                    key: "id",
                },
            },
            local_storage_folder_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: LocalStorageFolder,
                    key: "id",
                },
            },
            external_api_endpoint_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: ExternalAPIEndpoint,
                    key: "id",
                },
            },
            external_ftp_endpoint_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: ExternalFTPEndpoint,
                    key: "id",
                },
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
            modelName: "ProcessingRuleDestination",
            tableName: "processing_rule_destinations",
            timestamps: true,
            validate: {
                onlyOneForeignKey() {
                    const foreignKeys = [
                        this.local_storage_folder_id,
                        this.external_api_endpoint_id,
                        this.external_ftp_endpoint_id,
                    ];
                    const nonNullKeys = foreignKeys.filter((key) => key !== null);
                    if (nonNullKeys.length !== 1) {
                        throw new Error("Exactly one of local_storage_folder_id, external_api_endpoint_id, or external_ftp_endpoint_id must be non-null.");
                    }
                },
            },
        }
    );

    return ProcessingRuleDestination;
}

export default ProcessingRuleDestination;