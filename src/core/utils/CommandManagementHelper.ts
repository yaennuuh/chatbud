import { DatabaseHelper } from "./DatabaseHelper";
import * as _ from 'lodash';
import { ICommand } from "./entities/ICommand";
import { Command } from "./entities/Command";
import { PluginManager } from "../plugins/PluginManager";

export class CommandManagementHelper {

    private static instance: CommandManagementHelper;
    database: Datastore;
    pluginManager: PluginManager;

    private constructor() {
        this.database = DatabaseHelper.getInstance().getDatabase('chatbud-core-commandmanagement');
        this.pluginManager = PluginManager.getInstance();
    }

    static getInstance(): CommandManagementHelper {
        if (CommandManagementHelper.instance == null) {
            CommandManagementHelper.instance = new CommandManagementHelper();
        }

        return CommandManagementHelper.instance;
    }

    getPluginCommands = (): any[] => {
        return this.pluginManager.getAllCommandsConfigs();
    }

    getEmptyCommand = (): ICommand => {
        return new Command();
    }

    getAllCommands = async (): Promise<ICommand[]> => {
        const documents = await this.database.find({});
        return documents.map((document: Object) => new Command(document));
    }

    getCommandByDocumentId = async (id: string): Promise<ICommand> => {
        const document = await this.database.findOne({ _id: id });
        return new Command(document);
    }

    getCommandByNameAndType = async (commandName: string, commandType: string, ): Promise<ICommand> => {
        const document = await this.database.findOne({ command: { $regex: new RegExp('^'+commandName+'$', 'i') }, active: true, commandType: commandType });
        return new Command(document);
    }

    updateCommand = async (command: ICommand): Promise<void> => {
        let document = command.toDocument(command);

        if (command.id !== null && command.id !== undefined && command.id.length) {
            await this.database.update({ '_id': command.id }, { $set: document });
        } else {
            await this.database.insert(document);
        }
    }

    deleteCommand = async (id: string): Promise<void> => {
        if (id !== null && id !== undefined && id.length) {
            await this.database.remove({ "_id": id }, {});
        }
    }
}