/* eslint-disable @typescript-eslint/no-explicit-any */
import DB from '../database'; // Importing the database connection and models
import layoutImages_default from './seed_data/layoutImages_default';
import documentLayouts_default from './seed_data/documentLayouts_default';
import documentTypes_default from './seed_data/documentTypes_default';
import aiProviders_default from './seed_data/aiProviders_default';
import adminUsers_default from './seed_data/adminUsers_default';
import windowsAppInstances_default from './seed_data/windowsAppInstances_default';
import ssoProviders_default from './seed_data/ssoProviders_default';

// THIS FILE MUST NOT BE IMPORTED OR USED IN PRODUCTION ENVIRONMENT!
// THIS FILE IS FOR TESTING PURPOSES ONLY!

function fill_sso_providers(ssoProviders_arg: any[] = ssoProviders_default) {
    return new Promise<void>(function (resolve, reject) {
        const ssoProviders_PromiseList: Promise<any>[] = [];
        ssoProviders_arg.forEach((provider) => {
            ssoProviders_PromiseList.push(
                DB.sso_providers.create({
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

function fill_layout_images(layoutImages_arg: any[] = layoutImages_default) {
    return new Promise<void>(function (resolve, reject) {
        const layoutImages_PromiseList: Promise<any>[] = [];
        // Use imported layoutImages_default
        layoutImages_arg.forEach((layoutImage) => {
            layoutImages_PromiseList.push(
                DB.layout_images.create({
                    id: layoutImage.id,
                    image: Buffer.from(layoutImage.image_base64, 'base64'),
                    width: layoutImage.width,
                    height: layoutImage.height,
                })
            );
            console.log("Layout image created:", layoutImage.id)
        });

        Promise.all(layoutImages_PromiseList)
            .then(() => {
                console.log("Layout images table filled!")
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving layoutImages table");
                reject(err);
            })
    });
}

function fill_document_layouts(documentLayouts_arg: any[] = documentLayouts_default) {
    return new Promise<void>(function (resolve, reject) {
        const documentLayouts_PromiseList: Promise<any>[] = [];
        // Use imported documentLayouts_default
        documentLayouts_arg.forEach((documentLayout) => {
            documentLayouts_PromiseList.push(
                DB.document_layouts.create({
                    id: documentLayout.id,
                    name: documentLayout.name,
                    fields: documentLayout.fields,
                    image_id: documentLayout.image_id
                })
            );
            console.log("Document layout created:", documentLayout.name)
        });

        Promise.all(documentLayouts_PromiseList)
            .then(() => {
                console.log("Document layouts table filled!")
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving documentLayouts table");
                reject(err);
            })
    });
}

function fill_document_types(documentTypes_arg: any[] = documentTypes_default) {
    return new Promise<void>(function (resolve, reject) {
        const documentTypes_PromiseList: Promise<any>[] = [];
        // Use imported documentTypes_default
        documentTypes_arg.forEach((documentType) => {
            documentTypes_PromiseList.push(
                DB.document_types.create({
                    id: documentType.id,
                    name: documentType.name,
                    description: documentType.description,
                    document_layout_id: documentType.document_layout_id,
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

function fill_ai_providers(aiProviders_arg: any[] = aiProviders_default) {
    return new Promise<void>(function (resolve, reject) {
        const aiProviders_PromiseList: Promise<any>[] = [];
        // Use imported aiProviders_default

        aiProviders_arg.forEach((aiProvider) => {
            aiProviders_PromiseList.push(
                DB.ai_providers.create({
                    id: aiProvider.id,
                    name: aiProvider.name,
                })
            );
            console.log("AI provider created:", aiProvider.name)
        });

        Promise.all(aiProviders_PromiseList)
            .then(() => {
                console.log("AI providers table filled!")
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving aiProviders table");
                reject(err);
            })
    });
}

function fill_windows_app_instances(windowsAppInstances_arg: any[] = windowsAppInstances_default) {
    return new Promise<void>(function (resolve, reject) {
        const windowsAppInstances_PromiseList: Promise<any>[] = [];
        // Use imported windowsAppInstances_default
        windowsAppInstances_arg.forEach((windowsAppInstance) => {
            windowsAppInstances_PromiseList.push(
                DB.windows_app_instances.create({
                    id: windowsAppInstance.id,
                    title: windowsAppInstance.title,
                    location: windowsAppInstance.location,
                    machine_id: windowsAppInstance.machine_id,
                    operational_mode: windowsAppInstance.operational_mode,
                    polling_frequency: windowsAppInstance.polling_frequency,
                })
            );
            console.log("Windows app instance created:", windowsAppInstance.title)
        });

        Promise.all(windowsAppInstances_PromiseList)
            .then(() => {
                console.log("Windows app instances table filled!")
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving windowsAppInstances table");
                reject(err);
            })
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fill_admin_users() {
    return new Promise<void>(function (resolve, reject) {
        const adminUsers_PromiseList: Promise<any>[] = [];
        // Use imported adminUsers_default

        adminUsers_default.forEach((user) => {
            adminUsers_PromiseList.push(
                DB.admin_users.create({
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
    if (!DB.sequelize) {
        throw new Error("Sequelize connection is not defined")
    }
    DB.sequelize.sync({ force: true }).then(function () {
        fill_layout_images().then(function () {
            console.log("Layout image seeding done!");
        });

        fill_document_layouts().then(function () {
            console.log("Document layout seeding done!");
        });

        fill_document_types().then(function () {
            console.log("Document type seeding done!");
        });

        fill_ai_providers().then(function () {
            console.log("AI provider seeding done!");
        });

        fill_windows_app_instances().then(function () {
            console.log("Windows app instance seeding done!");
        });

        fill_sso_providers().then(function () {
            console.log("SSO Provider seeding done!");
        });

        // fill_admin_users().then(function () {
        //     console.log("Admin Users seeding done!");
        // });
    });
}

console.log("DO NOT IMPORT THIS FILE IN PRODUCTION! seed.js/.ts");

db_seed();