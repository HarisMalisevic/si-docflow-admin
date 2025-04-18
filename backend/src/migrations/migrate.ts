import db from "../database/db";

async function db_sync() {
    if (!db.sequelize) {
        throw new Error("Sequelize connection is not defined")
    }

    db.sequelize.sync({ force: true }).then(function () {
        console.log("Database synchronized!");
    })
}

console.log("DO NOT IMPORT THIS FILE IN PRODUCTION! migrate.js/.ts")

db_sync()
