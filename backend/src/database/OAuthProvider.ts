import { Sequelize, DataTypes } from "sequelize";

export default function (sequelize: Sequelize, dataTypes: typeof DataTypes) {
    const OAuthProvider = sequelize.define("oauth_providers", {
        name: {
            type: dataTypes.TEXT,
            allowNull: false,
        },
        client_id: { // ID nase aplikacije koji dobijemo prilikom registracije aplikacije na OAuth serveru
            type: dataTypes.TEXT,
            allowNull: false,
        },
        client_secret: { // Tajni ključ aplikacije koji dobijemo prilikom registracije aplikacije na OAuth serveru
            type: dataTypes.TEXT,
            allowNull: false,
        },
        callback_url: { // URL na koji OAuth server šalje korisnika nakon autentifikacije
            type: dataTypes.TEXT,
            allowNull: false,
        },

    },
        {
            freezeTableName: true
        });
    return OAuthProvider;
}