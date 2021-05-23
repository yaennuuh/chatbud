import { CommandAction } from "./CommandAction";
import { CommandCondition } from "./CommandCondition";
import { CommandField } from "./CommandField";
import { CommandType } from "./CommandTypeEnum";
import { ICommand } from "./ICommand";
import { ICommandAction } from "./ICommandAction";
import { ICommandCondition } from "./ICommandCondition";
import { ICommandField } from "./ICommandField";

export class Command implements ICommand {
    private documentId: string;
    private command: string;
    private conditions: ICommandCondition[];
    private actions: ICommandAction[];
    private fields: ICommandField[];
    private description: string;
    private active: boolean;
    private commandType: CommandType;

    constructor(active?: boolean, commandType?: CommandType, documentId?: string) {
        this.documentId = !!documentId ? documentId : null;
        this.command = '';
        this.conditions = [];
        this.actions = [];
        this.fields = [];
        this.description = '';
        this.active = !!active ? active : false;
        this.commandType = !!commandType ? commandType : CommandType.COMMAND;
    }

    getDocumentId = (): string => {
        return this.documentId;
    }
    setDocumentId = (documentId: string): void => {
        this.documentId = documentId;
    }

    getCommand = (): string => {
        return this.command;
    }
    setCommand = (command: string): void => {
        this.command = command;
    }

    getDescription = (): string => {
        return this.description;
    }
    setDescription = (description: string): void => {
        this.description = description;
    }

    isActive = (): boolean => {
        return this.active;
    }
    setIsActive = (active: boolean): void => {
        this.active = active;
    }

    getCommandType = (): CommandType => {
        return this.commandType;
    }
    setCommandType = (commandType: CommandType): void => {
        this.commandType = commandType;
    }

    createNewCondition = (id: string, pluginId: string, functionName: string, fieldId?: string): ICommandCondition => {
        return new CommandCondition(id, pluginId, functionName, fieldId);
    }
    getConditions = (): ICommandCondition[] => {
        return this.conditions;
    }
    setConditions = (conditions: ICommandCondition[]): void => {
        this.conditions = conditions;
    }
    addCondition = (condition: ICommandCondition): void => {
        this.conditions.push(condition);
    }
    removeCondition = (condition: ICommandCondition): void => {
        this.conditions = this.conditions.filter(function(filterCondition, index, arr){ 
            return filterCondition.getPluginId() != condition.getPluginId() || filterCondition.getId() != condition.getId();
        });
    }

    createNewAction = (id: string, pluginId: string, functionName: string, fieldId?: string, conditions?: string[]): ICommandAction => {
        return new CommandAction(id, pluginId, functionName, fieldId, conditions);
    }
    getActions = (): ICommandAction[] => {
        return this.actions;
    }
    setActions = (actions: ICommandAction[]): void => {
        this.actions = actions;
    }
    addAction = (action: ICommandAction): void => {
        this.actions.push(action);
    }
    removeAction = (action: ICommandAction): void => {
        this.actions = this.actions.filter(function(filterAction, index, arr){ 
            return filterAction.getPluginId() != action.getPluginId() || filterAction.getId() != action.getId();
        });
    }

    createNewField = (id: string, pluginId: string, value: string): ICommandField => {
        return new CommandField(id, pluginId, value);
    }
    getFields = (): ICommandField[] => {
        return this.fields;
    }
    setFields = (fields: ICommandField[]): void => {
        this.fields = fields;
    }
    addField = (field: ICommandField): void => {
        this.fields.push(field);
    }
    removeField = (field: ICommandField): void => {
        this.fields = this.fields.filter(function(filterField, index, arr){ 
            return filterField.getPluginId() != field.getPluginId() || filterField.getId() != field.getId();
        });
    }
}