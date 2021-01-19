export interface ICommandAction {
    getId(): string;
    getPluginId(): string;
    getConditions(): string[];
}