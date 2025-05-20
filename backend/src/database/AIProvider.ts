import { DataTypes, Model, Optional, Sequelize } from "sequelize";

// Define the attributes for the AIProvider model
interface AIProviderAttributes {
    id: number;
    name: string;
}

// Define the creation attributes (optional fields for new instances)
export type AIProviderCreationAttributes = Optional<AIProviderAttributes, "id">;

// Define the AIProvider model class
class AIProvider extends Model<AIProviderAttributes, AIProviderCreationAttributes> implements AIProviderAttributes {
    public id!: number;
    public name!: string;
}

export function initAIProvider(sequelize: Sequelize) {
    AIProvider.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "AIProvider",
            tableName: "ai_providers",
            freezeTableName: true,
        }
    );

    return AIProvider;
}

export default AIProvider;