import { ICommandCondition } from "./ICommandCondition";

export class CommandCondition implements ICommandCondition {
    private id: string;
    private pluginId: string;
    private actionId: string;

    constructor(id: string, pluginId: string, actionId?: string) {
        this.id = id;
        this.pluginId = pluginId;
        this.actionId = actionId;
    }

    getId(): string {
        return this.id;
    }
    getPluginId(): string {
        return this.pluginId;
    }
    getActionId(): string {
        return this.actionId;
    }
    
}