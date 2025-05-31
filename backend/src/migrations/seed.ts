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

let layoutImages_default: any[] = [];
try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    layoutImages_default = require('./layout_images_init').default;
} catch (error) {
    console.warn("layout_images_init module not found, using empty array for layoutImages_default. " + error);
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

function fill_layout_images(layoutImages_arg: any[] = layoutImages_default) {
    return new Promise<void>(function (resolve, reject) {
        const layoutImages_PromiseList: Promise<any>[] = [];

        layoutImages_arg.forEach((layoutImage) => {
            layoutImages_PromiseList.push(
                db.layout_images.create({
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

function fill_document_layouts() {
    return new Promise<void>(function (resolve, reject) {
        const documentLayouts_PromiseList: Promise<any>[] = [];
        const documentLayouts_default = [
            {
                id: 1,
                name: "Zahtjev za sufinanciranje po mjeri",
                fields: "[\n" +
                    "  {\n" +
                    "    \"name\":\"Služba za zapošljavanje\",\n" +
                    "    \"upper_left\":[349.4000015258789,268.2337304615342],\n" +
                    "    \"lower_right\":[510.4000015258789,298.2375035718348],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Ime i prezime\",\n" +
                    "    \"upper_left\":[310.4000015258789,321.6404462163515],\n" +
                    "    \"lower_right\":[628.4000015258789,344.6433389342487],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"JMBG\",\n" +
                    "    \"upper_left\":[310.4000015258789,352.6443450969955],\n" +
                    "    \"lower_right\":[628.4000015258789,374.64711204454926],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Djelatnost\",\n" +
                    "    \"upper_left\":[311.396856871791,381.68901198480876],\n" +
                    "    \"lower_right\":[626.4031461799666,406.6101324083887],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Kanton / Županija\",\n" +
                    "    \"upper_left\":[310.4000015258789,414.65214285828336],\n" +
                    "    \"lower_right\":[628.4000015258789,437.65503557618047],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Općina\",\n" +
                    "    \"upper_left\":[310.4000015258789,445.6560417389273],\n" +
                    "    \"lower_right\":[627.4000015258789,469.6590602271678],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Adresa\",\n" +
                    "    \"upper_left\":[310.40000152587857,477.70006679233313],\n" +
                    "    \"lower_right\":[628.4000015258785,501.6230844757363],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Kontakt osoba\",\n" +
                    "    \"upper_left\":[310.4000015258789,508.66397290091265],\n" +
                    "    \"lower_right\":[628.4000015258789,532.6669913891532],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"E-mail adresa / Telefon / Mobilni\",\n" +
                    "    \"upper_left\":[310.4000015258789,539.6678641512025],\n" +
                    "    \"lower_right\":[628.4000015258789,563.670882639443],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Broj osoba koje se dodatno zapošljavaju\",\n" +
                    "    \"upper_left\":[314.4000015258789,570.6717630318465],\n" +
                    "    \"lower_right\":[330.4000015258789,580.67302073528],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Kratko obrazloženje zahtjeva\",\n" +
                    "    \"upper_left\":[125.4000015258789,646.6813215779413],\n" +
                    "    \"lower_right\":[628.4000015258789,725.6912574350662],\n" +
                    "    \"is_multiline\":true\n" +
                    "  }\n" +
                    "]",
                image_id: 1,
            },
            {
                id: 2,
                name: "Obrazac FPO-K",
                fields: "[\n" +
                    "  {\n" +
                    "    \"name\":\"Naziv\",\n" +
                    "    \"upper_left\":[129.408164791185,129.098029136166],\n" +
                    "    \"lower_right\":[374.3918382605727,150.33710499348354],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Adresa\",\n" +
                    "    \"upper_left\":[135.4041681925456,155.02781449662046],\n" +
                    "    \"lower_right\":[374.39583485921224,176.41385969088367],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"OIB\",\n" +
                    "    \"upper_left\":[119.40000152587892,181.1091636749431],\n" +
                    "    \"lower_right\":[374.4000015258789,202.33905057041514],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Područni ured\",\n" +
                    "    \"upper_left\":[451.400001525879,129.17624607380102],\n" +
                    "    \"lower_right\":[691.400001525879,151.2590138261919],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Ispostava\",\n" +
                    "    \"upper_left\":[432.40000152587874,155.1995164045426],\n" +
                    "    \"lower_right\":[691.4000015258787,202.24542781188833],\n" +
                    "    \"is_multiline\":true\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Od\",\n" +
                    "    \"upper_left\":[285.4000015258789,292.19674663976764],\n" +
                    "    \"lower_right\":[372.40000152587885,314.27951439215855],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Do\",\n" +
                    "    \"upper_left\":[395.4000015258789,292.23674704218615],\n" +
                    "    \"lower_right\":[470.4000015258789,314.2395139897399],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Iznos stvarnih troškova\",\n" +
                    "    \"upper_left\":[570.4000660334093,384.64837356315957],\n" +
                    "    \"lower_right\":[691.3999370183487,405.65101474036993],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Ukupan iznos\",\n" +
                    "    \"upper_left\":[570.4000015258789,410.85166569401406],\n" +
                    "    \"lower_right\":[691.4000015258789,431.8543068712244],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Razlika\",\n" +
                    "    \"upper_left\":[570.3839380501981,436.56992472800647],\n" +
                    "    \"lower_right\":[691.4160650015593,456.7424179208892],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Povrat check\",\n" +
                    "    \"upper_left\":[81.40000152587893,508.32274546640264],\n" +
                    "    \"lower_right\":[98.40000152587893,524.2071089925],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Povrat iznos\",\n" +
                    "    \"upper_left\":[128.4000015258789,532.6669913891532],\n" +
                    "    \"lower_right\":[374.4000015258789,553.6696325663635],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Predujam check\",\n" +
                    "    \"upper_left\":[381.4000015258789,508.0638913344234],\n" +
                    "    \"lower_right\":[397.4000015258789,524.065903659917],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Predujam iznos\",\n" +
                    "    \"upper_left\":[443.4000015258789,532.1103885589811],\n" +
                    "    \"lower_right\":[691.4000015258788,554.0261980339005],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Broj računa\",\n" +
                    "    \"upper_left\":[355.4000015258789,575.4723774119902],\n" +
                    "    \"lower_right\":[614.4000015258789,620.4780370774412],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Banka\",\n" +
                    "    \"upper_left\":[68.4000015258789,608.4765278333209],\n" +
                    "    \"lower_right\":[349.4000015258789,640.4805524843082],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Mjesto\",\n" +
                    "    \"upper_left\":[92.4000015258789,643.4809297953383],\n" +
                    "    \"lower_right\":[275.4000015258789,668.4840740539221],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Datum\",\n" +
                    "    \"upper_left\":[286.4000015258789,643.4809297953383],\n" +
                    "    \"lower_right\":[428.4000015258789,669.4841998242655],\n" +
                    "    \"is_multiline\":false\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"name\":\"Ime i prezime\",\n" +
                    "    \"upper_left\":[80.4000015258789,693.4872030517978],\n" +
                    "    \"lower_right\":[298.4000015258789,728.4916050138152],\n" +
                    "    \"is_multiline\":false\n" +
                    "  }]",
                image_id: 2,
            },
        ];

        documentLayouts_default.forEach((documentLayout) => {
            documentLayouts_PromiseList.push(
                db.document_layouts.create({
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

function fill_document_types() {
    return new Promise<void>(function (resolve, reject) {
        const documentTypes_PromiseList: Promise<any>[] = [];
        const documentTypes_default = [
            {
                id: 1,
                name: "Zahtjev za sufinanciranje po mjeri",
                description: "Druga prilika 2021",
                document_layout_id: 1,
            },
            {
                id: 2,
                name: "Obrazac FPO-K",
                description: "Izvještaj o godišnjem obračunu - prihodu po osnovi obaveznog osiguranja od automobilske odgovornosti",
                document_layout_id: 2,
            },
        ];

        documentTypes_default.forEach((documentType) => {
            documentTypes_PromiseList.push(
                db.document_types.create({
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

function fill_ai_providers() {
    return new Promise<void>(function (resolve, reject) {
        const aiProviders_PromiseList: Promise<any>[] = [];
        const aiProviders_default = [
            {
                id: 1,
                name: "tesseract",
            },
            {
                id: 2,
                name: "googleVision",
            },
            {
                id: 3,
                name: "chatGpt",
            },
        ];

        aiProviders_default.forEach((aiProvider) => {
            aiProviders_PromiseList.push(
                db.ai_providers.create({
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

function fill_windows_app_instances() {
    return new Promise<void>(function (resolve, reject) {
        const windowsAppInstances_PromiseList: Promise<any>[] = [];
        const windowsAppInstances_default = [
            {
                id: 1,
                title: "Test Title",
                location: "Test Location",
                machine_id: "127.0.0.1:8080",
                operational_mode: "standalone",
                polling_frequency: 2,
            },
        ];

        windowsAppInstances_default.forEach((windowsAppInstance) => {
            windowsAppInstances_PromiseList.push(
                db.windows_app_instances.create({
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