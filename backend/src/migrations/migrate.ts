import DB from "../database";
import ssoProviders_default from './seed_data/ssoProviders_default';

if (!Array.isArray(ssoProviders_default)) {
    throw new Error("seed_data/ssoProviders_default does not export a default array.");
}

function fill_sso_providers() {
    return new Promise<void>(function (resolve, reject) {
        const ssoProviders_PromiseList: Promise<void>[] = [];

        ssoProviders_default.forEach((provider) => {
            ssoProviders_PromiseList.push(
                // Use upsert to avoid duplicate key errors
                DB.sso_providers.upsert({
                    display_name: provider.display_name,
                    api_name: provider.api_name,
                    client_id: provider.clientId,
                    client_secret: provider.clientSecret,
                    callback_url: provider.callbackURL,
                    authorization_url: provider.authorizationURL,
                    token_url: provider.tokenURL,
                }).then(() => {
                    console.log("SSO provider upserted:", provider.api_name);
                })
            );
        });

        Promise.all(ssoProviders_PromiseList)
            .then(() => {
                console.log("SSO providers table filled!");
                resolve();
            })
            .catch((err) => {
                console.error("Error while resolving SSO providers table", err);
                reject(err);
            });
    });
}

async function db_sync() {
    if (!DB.sequelize) {
        throw new Error("Sequelize connection is not defined");
    }

    // Check for -F flag in command line arguments
    const force = process.argv.includes('-F');

    console.log(`Running database synchronization with force: ${force}`);

    await DB.sequelize.sync({ force, alter: !force });

    console.log(`Database synchronized! (force: ${force}, alter: ${!force})`);

    fill_sso_providers().then(function () {
        console.log("SSO Provider seeding done!");
    });
}

console.log("DO NOT IMPORT THIS FILE IN PRODUCTION! migrate.js/.ts");

db_sync();