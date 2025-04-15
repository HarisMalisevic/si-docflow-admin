/* eslint-disable @typescript-eslint/no-explicit-any */
import db from '../database/db'; // Importing the database connection and models

// THIS FILE MUST NOT BE IMPORTED OR USED IN PRODUCTION ENVIRONMENT!
// THIS FILE IS FOR TESTING PURPOSES ONLY!


let ssoProviders_default: any[] = [];
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ssoProviders_default = require('./sso_init').default;
} catch (error) {
    console.warn("sso_init module not found, using empty array for ssoProviders_default. " + error);
}

function fill_sso_providers(ssoProviders_arg: any[] = ssoProviders_default) {

    return new Promise<void>(function (resolve, reject) {
        const ssoProviders_PromiseList: Promise<any>[] = [];

        ssoProviders_arg.forEach((provider) => {
            ssoProviders_PromiseList.push(
                db.sso_providers.create({
                    display_name: provider.display_name,
                    api_name: provider.api_name,
                    client_id: provider.clientId,
                    client_secret: provider.clientSecret,
                    callback_url: provider.callbackURL,
                    authorization_url: provider.authorizationURL,
                    token_url: provider.tokenURL,
                })
            );
            console.log("SSO provider created:", provider.api_name)
        });

        Promise.all(ssoProviders_PromiseList)
            .then(() => {
                console.log("SSO providers table filled!")
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving SSO providers table", err);
                reject(err);
            })
    });

}

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

function fill_admin_users() {
    return new Promise<void>(function (resolve, reject) {
        const adminUsers_PromiseList: Promise<any>[] = [];

        const adminUsers_default = [
            {
                email: "admin@example.com",
                password: "admin",
                sso_provider: null,
                sso_id: null,
                access_token: null,
                is_super_admin: false,
            },
            {
                email: "user1@example.com",
                password: "user1",
                sso_provider: null,
                sso_id: null,
                access_token: null,
                is_super_admin: false,
            },
            {
                email: "user2@example.com",
                password: "user2",
                sso_provider: null,
                sso_id: null,
                access_token: null,
                is_super_admin: false,
            }
        ];

        adminUsers_default.forEach((user) => {
            adminUsers_PromiseList.push(
                db.admin_users.create({
                    email: user.email,
                    password: user.password,
                    sso_provider: user.sso_provider,
                    sso_id: user.sso_id,
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

async function db_seed() {
    if (!db.sequelize) {
        throw new Error("Sequelize connection is not defined")
    }
    db.sequelize.sync({ force: true }).then(function () {
        fill_document_types().then(function () {
            console.log("Document type seeding done!");
        });

        fill_sso_providers().then(function () {
            console.log("SSO Provider seeding done!");
        });

        // fill_admin_users().then(function () {
        //     console.log("Admin Users seeding done!");
        // });
    });
}

console.log("DO NOT IMPORT THIS FILE IN PRODUCTION! seed.js/.ts")

db_seed()