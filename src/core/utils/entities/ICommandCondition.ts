export interface ICommandCondition {
    getId(): string;
    getPluginId(): string;
    getActionId(): string | null;
}