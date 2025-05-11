import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define the attributes for the RemoteInitiator model
interface RemoteInitiatorAttributes {
    id: number;
    initiator_key: string;
}

type RemoteInitiatorCreationAttributes = Optional<RemoteInitiatorAttributes, "id">;

// Define the RemoteInitiator model class
class RemoteInitiator extends Model<RemoteInitiatorAttributes, RemoteInitiatorCreationAttributes> implements RemoteInitiatorAttributes {
    public id!: number;
    public initiator_key!: string;
}

export function initRemoteInitiator(sequelize: Sequelize) {
    RemoteInitiator.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            initiator_key: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
        },
        {
            sequelize,
            modelName: "RemoteInitiator",
            tableName: "remote_initiators",
            freezeTableName: true,
        }
    );

    return RemoteInitiator;
}

export default RemoteInitiator;