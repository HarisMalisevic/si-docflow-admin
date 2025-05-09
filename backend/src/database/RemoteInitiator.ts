import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { randomBytes } from "crypto";

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


    private static readonly KEY_SIZE_BYTES = 16;

    public static async generateKey(): Promise<string> {
        // Static method to generate a new unique initiator key
        let key: string;
        let exists: RemoteInitiator | null;

        do {
            // Generate a 32-character hexadecimal string
            key = randomBytes(RemoteInitiator.KEY_SIZE_BYTES).toString("hex");
            exists = await RemoteInitiator.findOne({
                where: { initiator_key: key }
            });
        } while (exists); // Repeat until a unique key is found

        return key;
    }
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