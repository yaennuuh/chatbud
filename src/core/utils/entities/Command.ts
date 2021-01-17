import { ICommand } from "./ICommand";
import { ICommandAction } from "./ICommandAction";
import { ICommandCondition } from "./ICommandCondition";

export class Command implements ICommand {
    private documentId: string;
    private command: string;
    private conditions: ICommandCondition[];
    private actions: ICommandAction[];
    private description: string;
    private active: boolean;

    constructor(active?: boolean, documentId?: string) {
        this.documentId = !!documentId ? documentId : null;
        this.command = '';
        this.conditions = [];
        this.actions = [];
        this.description = '';
        this.active = !!active ? active : false;
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
    getConditions = (): ICommandCondition[] => {
        return this.conditions;
    }
    getActions = (): ICommandAction[] => {
        return this.actions;
    }
    setConditions = (conditions: ICommandCondition[]): void => {
        this.conditions = conditions;
    }
    setActions = (actions: ICommandAction[]): void => {
        this.actions = actions;
    }
    getDescription = (): string => {
        return this.description;
    }
    isActive = (): boolean => {
        return this.active;
    }

    setCommand = (command: string): void => {
        this.command = command;
    }
    addCondition = (condition: ICommandCondition): void => {
        this.conditions.push(condition);
    }
    addAction = (action: ICommandAction): void => {
        this.actions.push(action);
    }
    setDescription = (description: string): void => {
        this.description = description;
    }
    setIsActive = (active: boolean): void => {
        this.active = active;
    }
}