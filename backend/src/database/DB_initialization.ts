/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import db from './db'; // Importing the database connection and models

function fill_document_types() {
    return new Promise<void>(function (resolve, reject) {

        const documentTypes_PromiseList: Promise<any>[] = [];

        const documentTypes_default = [
            {
                name: "ŠV-20",
                description: "Potrebno za upis u naredni semestar",
            },
            {
                name: "Ugovor o prodaji",
                description: "Ugovor koji se koristi za prodaju nekretnine.",
            },
            {
                name: "CIPS",
                description: "Potrebno za izdavanje licne karte.",
            },
        ];

        documentTypes_default.forEach((documentType) => {
            documentTypes_PromiseList.push(
                db.document_types.create({
                    name: documentType.name,
                    description: documentType.description
                })
            );
            console.log("Document type created:", documentType.name)
        });

        Promise.all(documentTypes_PromiseList)
            .then(() => {
                console.log("Document types table filled!")
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving documentTypes table");
                reject(err);
            })


    });
}

function fill_oauth_providers() {

    return new Promise<void>(function (resolve, reject) {
        const oauthProviders_PromiseList: Promise<any>[] = [];

        const oauthProviders_default = [
            {
                name: "Google",
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                callback_url: process.env.GOOGLE_CALLBACK_URL,
            }
        ];

        oauthProviders_default.forEach((provider) => {
            oauthProviders_PromiseList.push(
                db.oauth_providers.create({
                    name: provider.name,
                    client_id: provider.client_id,
                    client_secret: provider.client_secret,
                })
            );
            console.log("OAuth provider created:", provider.name)
        });

        Promise.all(oauthProviders_PromiseList)
            .then(() => {
                console.log("OAuth providers table filled!")
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving OAuth providers table", err);
                reject(err);
            })
    });

}

function fill_admin_users() {
    return new Promise<void>(function (resolve, reject) {
        const adminUsers_PromiseList: Promise<any>[] = [];

        const adminUsers_default = [
            {
                email: "admin@example.com",
                password: "admin",
                oauth_provider: null,
                oauth_id: null,
                access_token: null,
            },
            {
                email: "user1@example.com",
                password: "user1",
                oauth_provider: null,
                oauth_id: null,
                access_token: null,
            },
            {
                email: "user2@example.com",
                password: "user2",
                oauth_provider: null,
                oauth_id: null,
                access_token: null,
            }
        ];

        adminUsers_default.forEach((user) => {
            adminUsers_PromiseList.push(
                db.admin_users.create({
                    email: user.email,
                    password: user.password,
                    oauth_provider: user.oauth_provider,
                    oauth_id: user.oauth_id,
                    access_token: user.access_token,
                })
            );
            console.log("User created:", user.email)
        });

        Promise.all(adminUsers_PromiseList)
            .then(() => {
                console.log("Users table filled!")
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving users table", err);
                reject(err);
            })
    });
}

function db_init() {
    if (!db.sequelize) {
        throw new Error("Sequelize connection is not defined")
    }
    db.sequelize.sync({ force: true }).then(function () {
        fill_document_types().then(function () {
            console.log("Table creation done!");
        });

        fill_oauth_providers().then(function () {
            console.log("Table creation done!");
        });

        fill_admin_users().then(function () {
            console.log("Table creation done!");
        });
    });
}

export default db_init;