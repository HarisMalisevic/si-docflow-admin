import { Sequelize, DataTypes, Model, Optional, ForeignKey } from "sequelize";
import WindowsAppInstance from "./WindowsAppInstance";

// Define the ClientActionType enum
export enum ClientActionType {
    INSTANCE_STARTED = "instance_started",
    PROCESSING_REQ_SENT = "processing_req_sent",
    PROCESSING_RESULT_RECEIVED = "processing_result_received",
    COMMAND_RECEIVED = "command_received",
    INSTANCE_STOPPED = "instance_stopped"
}

// Define the attributes for the ClientLog model
interface ClientLogAttributes {
    id: number;
    instance_id: number;
    action: ClientActionType;
}

// Define the creation attributes (optional fields for new instances)
type ClientLogCreationAttributes = Optional<ClientLogAttributes, "id">;

// Define the ClientLog model class
class ClientLog extends Model<ClientLogAttributes, ClientLogCreationAttributes> implements ClientLogAttributes {
    public id!: number;
    public instance_id!: ForeignKey<WindowsAppInstance["id"]>;
    public action!: ClientActionType;
}

export function initClientLog(sequelize: Sequelize) {
    ClientLog.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            instance_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "windows_app_instances", // FK to WindowsAppInstance table
                    key: "id",
                },
            },
            action: {
                type: DataTypes.ENUM,
                values: Object.values(ClientActionType),
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: "ClientLog",
            tableName: "client_logs",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return ClientLog;
}

export default ClientLog;