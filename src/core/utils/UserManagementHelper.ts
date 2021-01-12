import { DatabaseHelper } from "./DatabaseHelper";
import { ITwitchUser } from "./entities/ITwitchUser";
import { TwitchUser } from './entities/TwitchUser';

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

    getTwitchUserById = (userId: string): Promise<ITwitchUser> => {
        return this.database.findOne({ 'twitchUserId': userId }).then((document): ITwitchUser => {
            if (document) {
                return new TwitchUser(document['twitchUserId'], document['twitchUsername']);
            }
            return undefined;
        });
    }

    getTwitchUserByUsername = (username: string): string => {
        return '';
    }

    addTwitchUser = async (userId: string, username: string): Promise<void> => {
        let twitchUser: ITwitchUser = await this.getTwitchUserById(userId);
        if (twitchUser && twitchUser.getUsername() != username) {
            await this.updateTwitchUsername(userId, username);
        } else if (!twitchUser) {
            await this.database.insert({ 'twitchUserId': userId, 'twitchUsername': username });
        }
    }

    checkIfTwitchUserIdExists = (userId: string): boolean => {
        return !!this.getTwitchUserById(userId);
    }

    private updateTwitchUsername = (userId: string, username: string): Promise<number> => {
        console.log('gonna update user');
        return this.database.update({'twitchUserId': userId}, { $set: { 'twitchUsername': username } });
    }
}