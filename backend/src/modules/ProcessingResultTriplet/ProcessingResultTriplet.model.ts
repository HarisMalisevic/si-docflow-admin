import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import AIProvider from "../AIProvider/AIProvider.model";

// Define the attributes for the ProcessingResultsTriplet model
interface ProcessingResultsTripletAttributes {
    id: number;
    image: Buffer;
    ai_data: string;
    user_data: string;
    ai_provider_id?: number;
}

// Define the creation attributes (optional fields for new instances)
export type ProcessingResultsTripletCreationAttributes = Optional<ProcessingResultsTripletAttributes, "id">;

// Define the ProcessingResultsTriplet model class
class ProcessingResultsTriplet extends Model<ProcessingResultsTripletAttributes, ProcessingResultsTripletCreationAttributes> implements ProcessingResultsTripletAttributes {
    public id!: number;
    public image!: Buffer;
    public ai_data!: string;
    public user_data!: string;
    public ai_provider_id?: number;
}

export function initProcessingResultsTriplet(sequelize: Sequelize) {
    ProcessingResultsTriplet.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            image: {
                type: DataTypes.BLOB("medium"), // Medium - up to 16MB
                allowNull: false,
            },
            ai_data: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_data: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            ai_provider_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: AIProvider,
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "ProcessingResultsTriplet",
            tableName: "processing_results_triplets",
            freezeTableName: true,
        }
    );

    return ProcessingResultsTriplet;
}

export default ProcessingResultsTriplet;