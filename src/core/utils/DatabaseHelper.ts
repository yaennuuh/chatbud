export class DatabaseHelper {
    
    private static instance: DatabaseHelper;
    private connection: any; // TODO: set real type

    private constructor() {
        // TODO: implement database connection
    }

    static getInstance(): DatabaseHelper {
        if (DatabaseHelper.instance == null) {
            DatabaseHelper.instance = new DatabaseHelper();
        }

        return DatabaseHelper.instance;
    }

    getRepository = (repositoryName: string):any => { // Set real return type
        return {};
    }
}