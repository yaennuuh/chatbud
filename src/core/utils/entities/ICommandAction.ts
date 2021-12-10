import { CommandAction } from "./CommandAction";

export interface ICommandAction {
    get id(): string;
    set id(value: string);
    get pluginId(): string;
    set pluginId(value: string);
    get platform(): string;
    set platform(value: string);
    get actionFunction(): string;
    set actionFunction(value: string);
    get order(): number;
    set order(value: number);
    get fieldType(): string;
    set fieldType(value: string);
    get fieldTitle(): string;
    set fieldTitle(value: string);
    get fieldValue(): string;
    set fieldValue(value: string);
    get fieldDataFunction(): string;
    set fieldDataFunction(value: string);
    get requiredConditionFunctions(): string[];
    set requiredConditionFunctions(value: string[]);
    fromDocument(document: Object): ICommandAction;
    toDocument(commandAction: ICommandAction): Object;
}