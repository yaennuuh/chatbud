import { DatabaseHelper } from "./DatabaseHelper";
import { UserManagementHelper } from "./UserManagementHelper";
import moment from 'moment';

export class CooldownHelper {

    private databaseHelper: DatabaseHelper;
    repository: any; // Set real repository type

    private userManagementHelper: UserManagementHelper;

    constructor() {
        this.userManagementHelper = UserManagementHelper.getInstance();
        this.databaseHelper = DatabaseHelper.getInstance();
        this.repository = this.databaseHelper.getRepository('cooldown');
    }

    // GLOBAL
    hasCooldownForGlobal = (command: string): boolean => {
        return this.hasCooldown(command, 'global', undefined);
    }

    getCooldownForGlobal = (command: string): Date => {
        return this.getCooldown(command, 'global', undefined);
    }

    setCooldownForGlobal = (command: string, seconds: number): boolean => {
        return this.setCooldown(command, 'global', undefined, seconds);
    }

    // USER
    hasCooldownForUser = (command: string, userId: string, isUsername?: boolean): boolean => {
        const realUserId = this.checkUserId(userId, isUsername);
        return realUserId ? this.hasCooldown(command, 'user', realUserId): undefined;
    }

    getCooldownForUser = (command: string, userId: string, isUsername?: boolean): Date => {
        const realUserId = this.checkUserId(userId, isUsername);
        return realUserId ? this.getCooldown(command, 'user', userId): undefined;
    }

    setCooldownForUser = (command: string, userId: string, seconds: number, isUsername?: boolean): boolean => {
        const realUserId = this.checkUserId(userId, isUsername);
        return realUserId ? this.setCooldown(command, 'user', userId, seconds): undefined;
    }

    // ENTITY
    hasCooldownForEntity = (command: string, entityName: string, entityValue: string): boolean => {
        if (entityName === 'global') {
            return this.hasCooldownForGlobal(command);
        } else if (entityName === 'user') {
            return this.hasCooldownForUser(command, entityValue);
        }
        return this.hasCooldown(command, entityName, entityValue);
    }

    getCooldownForEntity = (command: string, entityName: string, entityValue: string): Date => {
        if (entityName === 'global') {
            return this.getCooldownForGlobal(command);
        } else if (entityName === 'user') {
            return this.getCooldownForUser(command, entityValue);
        }
        return this.getCooldown(command, entityName, entityValue);
    }

    setCooldownForEntity = (command: string, entityName: string, entityValue: string, seconds: number): boolean => {
        if (entityName === 'global') {
            return this.setCooldownForGlobal(command, seconds);
        } else if (entityName === 'user') {
            return this.setCooldownForUser(command, entityValue, seconds);
        }
        return this.setCooldown(command, entityName, entityValue, seconds);
    }

    // Real entity cooldown
    private hasCooldown = (command: string, entityName: string, entityValue: string): boolean => {
        // TODO: call db
        return moment().isBefore(moment()); // put in enddate of cooldown
    }

    private getCooldown = (command: string, entityName: string, entityValue: string): Date => {
        // TODO: call db
        return moment().toDate();
    }

    private setCooldown = (command: string, entityName: string, entityValue: string, seconds: number): boolean => {
        // TODO: call db
        const futureDate = moment().add(seconds, 'seconds').toDate();
        return true;
    }

    private checkUserId = (userId: string, isUsername?: boolean): string => {
        let realUserId = undefined;

        if (isUsername) {
            realUserId = this.userManagementHelper.getTwitchUserIdByUsername(userId);
        } else if (this.userManagementHelper.checkIfTwitchUserIdExists(userId)){
            realUserId = userId;
        }

        return realUserId;
    }
}