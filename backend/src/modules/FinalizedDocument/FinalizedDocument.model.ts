import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface FinalizedDocumentAttributes {
    id: number;
    content: string;
}

type FinalizedDocumentCreationAttributes = Optional<FinalizedDocumentAttributes, "id">;

class FinalizedDocument extends Model<FinalizedDocumentAttributes, FinalizedDocumentCreationAttributes> implements FinalizedDocumentAttributes {
    public id!: number;
    public content!: string;
}

export function initFinalizedDocument(sequelize: Sequelize) {
    FinalizedDocument.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            content: {
                type: DataTypes.TEXT("long"),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "FinalizedDocument",
            tableName: "finalized_documents",
            freezeTableName: true,
        }
    );

    return FinalizedDocument;
}

export default FinalizedDocument;