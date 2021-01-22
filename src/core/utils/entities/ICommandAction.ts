export interface ICommandAction {
    getId(): string;
    getPluginId(): string;
    getRequiredConditions(): string[];
}