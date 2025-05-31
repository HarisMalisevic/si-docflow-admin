import DB from "../database";

async function db_sync() {
    if (!DB.sequelize) {
        throw new Error("Sequelize connection is not defined");
    }

    // Check for -F flag in command line arguments
    const force = process.argv.includes('-F');

    console.log(`Running database synchronization with force: ${force}`);

    await DB.sequelize.sync({ force, alter: !force });
    
    console.log(`Database synchronized! (force: ${force}, alter: ${!force})`);
}

console.log("DO NOT IMPORT THIS FILE IN PRODUCTION! migrate.js/.ts");

db_sync();