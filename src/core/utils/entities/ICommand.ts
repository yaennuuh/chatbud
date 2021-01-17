import { ICommandAction } from "./ICommandAction";
import { ICommandCondition } from "./ICommandCondition";

export interface ICommand {
    getCommand(): string,
    setCommand(command: string): void;

    getDocumentId(): string,
    setDocumentId(documentId: string): void;

    getConditions(): ICommandCondition[],
    setConditions(conditions: ICommandCondition[]): void,
    addCondition(condition: ICommandCondition): void;

    getActions(): ICommandAction[],
    setActions(actions: ICommandAction[]): void,
    addAction(action: ICommandAction): void;

    getDescription(): string,
    setDescription(description: string): void;

    isActive(): boolean
    setIsActive(active: boolean): void;
}