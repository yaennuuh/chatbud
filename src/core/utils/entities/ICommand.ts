import { CommandType } from "./CommandTypeEnum";
import { ICommandAction } from "./ICommandAction";
import { ICommandCondition } from "./ICommandCondition";

export interface ICommand {
    fromDocument(document: Object): void;
    toDocument(): Object;
    addActionToCommand(action: ICommandAction): void;
    addConditionToCommand(condition: ICommandCondition): void;
    get id(): string;
    set id(value: string);
    get commandType(): CommandType;
    set commandType(value: CommandType);
    get command(): string;
    set command(value: string);
    get active(): boolean;
    set active(value: boolean);
    get actions(): ICommandAction[];
    set actions(value: ICommandAction[]);
    get conditions(): ICommandCondition[];
    set conditions(value: ICommandCondition[]);
    get description(): string;
    set description(value: string);
}