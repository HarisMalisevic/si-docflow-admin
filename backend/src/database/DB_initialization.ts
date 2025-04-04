import db from './db'; // Importing the database connection and models

function fill_document_types() {
    return new Promise<void>(function (resolve, reject) {

        const documentTypes_PromiseList: Promise<any>[] = [];

        const documentTypes_default = [
            {
                name: "ŠV-20",
                description: "Potrebno za upis u naredni semestar",
                created_by: null
            },
            {
                name: "Ugovor o prodaji",
                description: "Ugovor koji se koristi za prodaju nekretnine.",
                created_by: null
            },
            {
                name: "CIPS",
                description: "Potrebno za izdavanje licne karte.",
                created_by: null
            },
        ];

        documentTypes_default.forEach((documentType) => {
            documentTypes_PromiseList.push(
                db.document_types.create({
                    name: documentType.name,
                    description: documentType.description,
                    created_by: documentType.created_by
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
                console.error("Error while resolving documentTypes table", err);
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
            //process.exit(); // Uncomment this line if you want to exit the process after initialization
        });
    });
}

export default db_init;