import { ICommandAction } from "./ICommandAction";
import { ICommandCondition } from "./ICommandCondition";
import { ICommandField } from "./ICommandField";

export interface ICommand {
    getCommand(): string;
    setCommand(command: string): void;

    getDocumentId(): string;
    setDocumentId(documentId: string): void;

    createNewCondition(id: string, pluginId: string): ICommandCondition;
    getConditions(): ICommandCondition[];
    setConditions(conditions: ICommandCondition[]): void;
    addCondition(condition: ICommandCondition): void;
    removeCondition(condition: ICommandCondition): void;

    createNewAction(id: string, pluginId: string, conditions?: string[]): ICommandAction;
    getActions(): ICommandAction[];
    setActions(actions: ICommandAction[]): void;
    addAction(action: ICommandAction): void;
    removeAction(action: ICommandAction): void;

    createNewField(id: string, pluginId: string, value: string): ICommandField;
    getFields(): ICommandField[];
    setFields(fields: ICommandField[]): void;
    addField(field: ICommandField): void;
    removeField(field: ICommandField): void;

    getDescription(): string;
    setDescription(description: string): void;

    isActive(): boolean;
    setIsActive(active: boolean): void;
}