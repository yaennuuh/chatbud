import { DatabaseHelper } from "./DatabaseHelper";
import { ITwitchUser } from "./entities/ITwitchUser";

export class UserManagementHelper {
    
    private static instance: UserManagementHelper;
    private databaseHelper: DatabaseHelper;
    repository: any; // Set real repository type

    private constructor() {
        this.databaseHelper = DatabaseHelper.getInstance();
        this.repository = this.databaseHelper.getRepository('usermanagement');
    }

    static getInstance(): UserManagementHelper {
        if (UserManagementHelper.instance == null) {
            UserManagementHelper.instance = new UserManagementHelper();
        }

        return UserManagementHelper.instance;
    }

    getTwitchUserById = (userId: string): ITwitchUser => {
        return undefined;
    }

    getTwitchUserByName = (username: string): ITwitchUser => {
        return undefined;
    }

    getTwitchUsernameById = (userId: string): string => {
        return '';
    }

    getTwitchUserIdByUsername = (username: string): string => {
        return '';
    }

    addTwitchUser = (userId: string, username: string): boolean => {
        let twitchUser: ITwitchUser = this.getTwitchUserById(userId);
        if (twitchUser && twitchUser.getUsername() != username) {
            this.updateTwitchUsername(userId, username);
        }
        return true;
    }

    checkIfTwitchUserIdExists = (userId: string): boolean => {
        return !!this.getTwitchUsernameById(userId);
    }

    private updateTwitchUsername = (userId: string, username: string): boolean => {
        return true;
    }
}