export interface ICommandAction {
    getId(): string;
    getPluginId(): string;
    getFunctionName(): string;
    getRequiredConditions(): string[];
    getFieldId(): string;
}