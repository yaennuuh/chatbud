import Datastore from 'nedb-promises';
import { app } from 'electron';

export class DatabaseHelper {

    private static instance: DatabaseHelper;
    private database: Object;

    private constructor() {
        // read all db files and prepare the datastore for them
        // example db.users = new Datastore('path/to/users.db');
        this.database = {};
    }

    static getInstance(): DatabaseHelper {
        if (DatabaseHelper.instance == null) {
            DatabaseHelper.instance = new DatabaseHelper();
        }

        return DatabaseHelper.instance;
    }

    getDatabase = (repositoryName: string): any => { // Set real return type
        if (!this.database.hasOwnProperty(repositoryName)) {
            this.database[repositoryName] = Datastore.create(`${app.getPath('userData')}/databases/${repositoryName}.db`);
        }
        this.database[repositoryName].load();
        return this.database[repositoryName];
    }
}