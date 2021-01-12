import { DatabaseHelper } from "./DatabaseHelper";
import { UserManagementHelper } from "./UserManagementHelper";
import { ICommandCooldown } from './entities/ICommandCooldown';
import { CommandCooldown } from './entities/CommandCooldown';

export class CooldownHelper {
    private static instance: CooldownHelper;

    private databaseHelper: DatabaseHelper;
    database: Datastore;

    private userManagementHelper: UserManagementHelper;

    private constructor() {
        this.userManagementHelper = UserManagementHelper.getInstance();
        this.databaseHelper = DatabaseHelper.getInstance();
        this.database = this.databaseHelper.getDatabase('chatbud-core-cooldown');
    }

    static getInstance(): CooldownHelper {
        if (CooldownHelper.instance == null) {
            CooldownHelper.instance = new CooldownHelper();
        }

        return CooldownHelper.instance;
    }

    // GLOBAL
    hasCooldownForGlobal = async (command: string): Promise<boolean> => {
        return this.hasCooldown(command, 'global', undefined);
    }

    getCooldownForGlobal = async (command: string): Promise<number> => {
        return this.getCooldown(command, 'global', undefined);
    }

    setCooldownForGlobal = async (command: string, seconds: number): Promise<void> => {
        return this.setCooldown(command, 'global', undefined, seconds);
    }

    // USER
    hasCooldownForUser = async (command: string, userId: string, isUsername?: boolean): Promise<boolean> => {
        const realUserId = await this.checkUserId(userId, isUsername);
        return realUserId ? this.hasCooldown(command, 'user', realUserId) : undefined;
    }

    getCooldownForUser = async (command: string, userId: string, isUsername?: boolean): Promise<number> => {
        const realUserId = await this.checkUserId(userId, isUsername);
        return realUserId ? this.getCooldown(command, 'user', realUserId) : undefined;
    }

    setCooldownForUser = async (command: string, userId: string, seconds: number, isUsername?: boolean): Promise<void> => {
        const realUserId = await this.checkUserId(userId, isUsername);
        return realUserId ? this.setCooldown(command, 'user', realUserId, seconds) : undefined;
    }

    // ENTITY
    hasCooldownForEntity = async (command: string, entityName: string, entityValue: string): Promise<boolean> => {
        if (entityName === 'global') {
            return this.hasCooldownForGlobal(command);
        } else if (entityName === 'user') {
            return this.hasCooldownForUser(command, entityValue);
        }
        return this.hasCooldown(command, entityName, entityValue);
    }

    getCooldownForEntity = async (command: string, entityName: string, entityValue: string): Promise<number> => {
        if (entityName === 'global') {
            return this.getCooldownForGlobal(command);
        } else if (entityName === 'user') {
            return this.getCooldownForUser(command, entityValue);
        }
        return this.getCooldown(command, entityName, entityValue);
    }

    setCooldownForEntity = async (command: string, entityName: string, entityValue: string, seconds: number): Promise<void> => {
        if (entityName === 'global') {
            return this.setCooldownForGlobal(command, seconds);
        } else if (entityName === 'user') {
            return this.setCooldownForUser(command, entityValue, seconds);
        }
        return this.setCooldown(command, entityName, entityValue, seconds);
    }

    // Real entity cooldown
    private hasCooldown = async (command: string, entityName: string, entityValue: string): Promise<boolean> => {
        const document = await this.getDocument(command, entityName, entityValue);
        const commandCooldown = this.mapDocumentToCommandCooldown(document);
        return commandCooldown && commandCooldown.isActive();
    }

    private getCooldown = async (command: string, entityName: string, entityValue: string): Promise<number> => {
        const document = await this.getDocument(command, entityName, entityValue);
        const commandCooldown = this.mapDocumentToCommandCooldown(document);
        return commandCooldown.getCooldownTime();
    }

    private setCooldown = async (command: string, entityName: string, entityValue: string, seconds: number): Promise<void> => {
        const document = await this.getDocument(command, entityName, entityValue);
        let commandCooldown = this.mapDocumentToCommandCooldown(document);
        if (!commandCooldown) {
            commandCooldown = new CommandCooldown(command, entityName, entityValue);
            commandCooldown.setEndDate(seconds);
            await this.database.insert(this.mapCommandCooldownToDocument(commandCooldown));
        } else {
            commandCooldown.setEndDate(seconds);

            let searchObject = { 'command': command, 'entityName': entityName };
            if (entityValue != undefined) {
                searchObject['entityValue'] = entityValue;
            }
            await this.database.update({ $and: [searchObject] }, this.mapCommandCooldownToDocument(commandCooldown));
        }
    }

    private getDocument = (command: string, entityName: string, entityValue: string): Promise<Document> => {
        let searchObject = { 'command': command, 'entityName': entityName };
        if (entityValue != undefined) {
            searchObject['entityValue'] = entityValue;
        }
        return this.database.findOne({ $and: [searchObject] });
    }

    private checkUserId = async (userId: string, isUsername?: boolean): Promise<string> => {
        let realUserId = undefined;

        if (isUsername) {
            realUserId = await this.userManagementHelper.getTwitchUserByUsername(userId);
        } else if (this.userManagementHelper.checkIfTwitchUserIdExists(userId)) {
            realUserId = userId;
        }

        return realUserId;
    }

    private mapDocumentToCommandCooldown = (document: Object): ICommandCooldown => {
        if (!document) return undefined;
        return new CommandCooldown(document['command'], document['entityName'], document['entityValue'], new Date(document['endDate']));
    }

    private mapCommandCooldownToDocument = (commandCooldown: ICommandCooldown): Object => {
        if (!commandCooldown) return undefined;
        return {
            'command': commandCooldown.getCommand(),
            'entityName': commandCooldown.getEntityName(),
            'entityValue': commandCooldown.getEntityValue(),
            'endDate': commandCooldown.getEndDate()
        };
    }
}