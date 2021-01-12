import { DatabaseHelper } from "./DatabaseHelper";
import { ITwitchUser } from "./entities/ITwitchUser";
import { TwitchUser } from './entities/TwitchUser';
import * as _ from 'lodash';

export class UserManagementHelper {

    private static instance: UserManagementHelper;
    private databaseHelper: DatabaseHelper;
    database: Datastore;

    private constructor() {
        this.databaseHelper = DatabaseHelper.getInstance();
        this.database = this.databaseHelper.getDatabase('chatbud-core-usermanagement');
    }

    static getInstance(): UserManagementHelper {
        if (UserManagementHelper.instance == null) {
            UserManagementHelper.instance = new UserManagementHelper();
        }

        return UserManagementHelper.instance;
    }

    getAllTwitchUsers = async (): Promise<ITwitchUser[]> => {
        const documents = await this.database.find({});
        return this.mapAllDocumentsToTwitchUsers(documents);
    }

    getTwitchUserById = async (userId: string): Promise<ITwitchUser> => {
        const document = await this.database.findOne({ 'twitchUserId': userId });
        return this.mapDocumentToTwitchUser(document);
    }

    getTwitchUserByUsername = async (username: string): Promise<ITwitchUser> => {
        const document = await this.database.findOne({ 'twitchUsername': username });
        return this.mapDocumentToTwitchUser(document);
    }

    addTwitchUser = async (userId: string, username: string): Promise<void> => {
        let twitchUser: ITwitchUser = await this.getTwitchUserById(userId);
        if (twitchUser && twitchUser.getUsername() != username) {
            await this.updateTwitchUsername(twitchUser, username);
        } else if (twitchUser) {
            await this.updateTwitchLastSeen(twitchUser, username);
        } else if (!twitchUser) {
            await this.database.insert(this.mapTwitchUserToDocument(new TwitchUser(userId, username, new Date())));
        }
    }

    deleteTwitchUser = async (twitchUser: ITwitchUser): Promise<number> => {
        return this.database.remove(this.mapTwitchUserToDocument(twitchUser), {});
    }

    checkIfTwitchUserIdExists = (userId: string): boolean => {
        return this.getTwitchUserById(userId) != undefined;
    }

    checkIfTwitchUsernameExists = (username: string): boolean => {
        return this.getTwitchUserByUsername(username) != undefined;
    }

    private updateTwitchUsername = (twitchUser: ITwitchUser, username: string): Promise<number> => {
        return this.database.update({ 'twitchUserId': twitchUser.getUserId() }, { $set: { 'twitchUsername': username, 'lastSeen': new Date() } });
    }

    private updateTwitchLastSeen = (twitchUser: ITwitchUser, username: string): Promise<number> => {
        return this.database.update({ 'twitchUserId': twitchUser.getUserId() }, { $set: { 'lastSeen': new Date() } });
    }

    private mapAllDocumentsToTwitchUsers = (documents: Object[]): ITwitchUser[] => {
        if (documents != undefined) {
            return _.map(documents, (document: Object): ITwitchUser => {
                return this.mapDocumentToTwitchUser(document);
            });
        }
        return null;
    }

    private mapDocumentToTwitchUser = (document: Object): ITwitchUser => {
        if (document != undefined) {
            return new TwitchUser(document['twitchUserId'], document['twitchUsername']);
        }
        return null;
    }

    private mapTwitchUserToDocument = (twitchUser: ITwitchUser): Object => {
        if (twitchUser === undefined) return undefined;
        return {
            'twitchUserId': twitchUser.getUserId(),
            'twitchUsername': twitchUser.getUsername(),
            'firstSeen': twitchUser.getFirstSeen(),
            'lastSeen': twitchUser.getLastSeen()
        };
    }
}