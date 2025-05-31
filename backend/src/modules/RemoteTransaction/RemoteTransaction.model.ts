import { DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import WindowsAppInstance from "../WindowsAppInstance/WindowsAppInstance.model";
import DocumentType from "../DocumentType/DocumentType.model";
import RemoteInitiator from "../RemoteInitiator/RemoteInitiator.model";

// Define the enum for status
export enum TransactionStatus {
    STARTED = "started",        // processing command received, parameters saved and transaction ID generated
    FORWARDED = "forwarded",    // command forwarded to Windows app, waiting for result
    FINISHED = "finished",      // processing result received and forwarded to command initiator
    FAILED = "failed",          // error(s) while processing
}

// Define the attributes for the RemoteTransaction model
interface RemoteTransactionAttributes {
    id: number;
    initiator_id: number;
    target_instance_id: number;
    document_type_id: number;
    file_name: string;
    status: TransactionStatus;
    socket_id: string;
}

// Define the creation attributes (optional fields for new instances)
export type RemoteTransactionCreationAttributes = Optional<RemoteTransactionAttributes, "id">;

export type RemoteTransactionUpdateAttributes = Partial<RemoteTransactionAttributes>;

// Define the RemoteTransaction model class
class RemoteTransaction extends Model<RemoteTransactionAttributes, RemoteTransactionCreationAttributes> implements RemoteTransactionAttributes {
    public id!: number;
    public initiator_id!: ForeignKey<RemoteInitiator["id"]>;
    public target_instance_id!: ForeignKey<WindowsAppInstance["id"]>;
    public document_type_id!: ForeignKey<DocumentType["id"]>;
    public file_name!: string;
    public status!: TransactionStatus;
    public socket_id!: string;
}

export function initRemoteTransaction(sequelize: Sequelize) {
    RemoteTransaction.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            initiator_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: RemoteInitiator,
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            target_instance_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: WindowsAppInstance,
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
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
            file_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM,
                values: Object.values(TransactionStatus),
                allowNull: false,
            },
            socket_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "RemoteTransaction",
            tableName: "remote_transactions",
            freezeTableName: true,
        }
    );

    return RemoteTransaction;
}

export default RemoteTransaction;