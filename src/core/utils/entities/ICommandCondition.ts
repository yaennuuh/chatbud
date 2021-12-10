export interface ICommandCondition {
    get id(): string;
    set id(value: string);
    get pluginId(): string;
    set pluginId(value: string);
    get platform(): string;
    set platform(value: string);
    get conditionFunction(): string;
    set conditionFunction(value: string);
    get fieldType(): string;
    set fieldType(value: string);
    get fieldTitle(): string;
    set fieldTitle(value: string);
    get fieldValue(): string;
    set fieldValue(value: string);
    get fieldDataFunction(): string;
    set fieldDataFunction(value: string);
    get automaticActionFunctions(): string[];
    set automaticActionFunctions(value: string[]);
    fromDocument(document: Object): ICommandCondition;
    toDocument(commandCondition: ICommandCondition): Object;
}