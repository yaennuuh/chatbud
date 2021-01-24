import { DatabaseHelper } from "./DatabaseHelper";
import * as _ from 'lodash';
import { ICommand } from "./entities/ICommand";
import { Command } from "./entities/Command";
import { CommandAction } from "./entities/CommandAction";
import { CommandCondition } from "./entities/CommandCondition";
import { ICommandCondition } from "./entities/ICommandCondition";
import { ICommandAction } from "./entities/ICommandAction";
import { PluginManager } from "../plugins/PluginManager";
import { ICommandField } from "./entities/ICommandField";
import { CommandField } from "./entities/CommandField";

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

    getEmptyCommand = (documentId?: string): ICommand => {
        return new Command(false, false, documentId);
    }

    getAllCommands = async (): Promise<ICommand[]> => {
        const documents = await this.database.find({});
        return this.mapAllDocumentsToCommands(documents);
    }

    getCommandByDocumentId = async (documentId: string): Promise<ICommand> => {
        const document = await this.database.findOne({ _id: documentId });
        return this.mapDocumentToCommand(document);
    }

    getCommandByName = async (commandName: string, channelPoints: boolean, ): Promise<ICommand> => {
        const document = await this.database.findOne({ command: commandName, active: true, channelPoints: channelPoints });
        return this.mapDocumentToCommand(document);
    }

    updateCommand = async (command: ICommand): Promise<void> => {
        let documentId = command.getDocumentId();
        let document = this.mapCommandToDocument(command);


        if (documentId != undefined && documentId.length >= 1) {
            await this.database.update({ '_id': documentId }, { $set: document });
        } else {
            await this.database.insert(document);
        }
    }

    deleteCommand = async (documentId: string): Promise<void> => {
        if (documentId && documentId.length >= 1) {
            await this.database.remove({ "_id": documentId }, {});
        }
    }

    private mapAllDocumentsToCommands = (documents: Object[]): ICommand[] => {
        if (documents != undefined) {
            return _.map(documents, (document: Object): ICommand => {
                return this.mapDocumentToCommand(document);
            });
        }
        return null;
    }

    private mapDocumentToCommand = (document: Object): ICommand => {
        let command: ICommand;
        if (document != undefined) {
            command = new Command(document['active'], document['channelPoints'], document['_id']);

            command.setCommand(document['command'] || '');

            let conditions = document['conditions'];
            conditions.forEach((condition) => {
                command.addCondition(new CommandCondition(condition['id'], condition['pluginId'], condition['functionName'], condition['fieldId']));
            });

            let actions = document['actions'];
            actions.forEach((action) => {
                command.addAction(new CommandAction(action['id'], action['pluginId'], action['functionName'], action['fieldId'], action['conditions']));
            });

            let fields = document['fields'];
            fields.forEach((field) => {
                command.addField(new CommandField(field['id'], field['pluginId'], field['value']));
            });

            command.setDescription(document['description'] || '');
        }

        return command;
    }

    private mapCommandToDocument = (command: ICommand): Object => {
        if (command === undefined) return undefined;
        let document = {
            'command': command.getCommand(),
            'conditions': _.map(command.getConditions(), (condition: ICommandCondition): Object => {
                return {
                    'id': condition.getId(),
                    'pluginId': condition.getPluginId(),
                    'functionName': condition.getFunctionName(),
                    'fieldId': condition.getFieldId()
                };
            }),
            'actions': _.map(command.getActions(), (action: ICommandAction): Object => {
                return {
                    'id': action.getId(),
                    'pluginId': action.getPluginId(),
                    'functionName': action.getFunctionName(),
                    'fieldId': action.getFieldId(),
                    'conditions': action.getRequiredConditions()
                };
            }),
            'fields': _.map(command.getFields(), (field: ICommandField): Object => {
                return {
                    'id': field.getId(),
                    'pluginId': field.getPluginId(),
                    'value': field.getValue()
                };
            }),
            'description': command.getDescription(),
            'active': command.isActive(),
            'channelPoints': command.isChannelPoints()
        };
        return document;
    }
}