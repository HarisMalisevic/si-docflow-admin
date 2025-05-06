import { Sequelize, DataTypes} from "sequelize";
import WindowsAppInstance from "./WindowsAppInstance";
import DocumentType from "./DocumentType";

export default function initAppInstanceDocumentType(sequelize: Sequelize) {
    const AppInstanceDocumentType = sequelize.define(
        "AppInstanceDocumentType",
        {
            windows_app_instance_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: WindowsAppInstance,
                    key: "id",
                },
            },
            document_type_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: DocumentType,
                    key: "id",
                },
            },
        },
        {
            tableName: "app_instance_document_types",
            freezeTableName: true,
            timestamps: false,
        }
    );

    return AppInstanceDocumentType;
}