export interface ICommandAction {
    getId(): string;
    getPluginId(): string;
    getConditionId(): string | null;
}