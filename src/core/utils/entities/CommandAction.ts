import { ICommandAction } from "./ICommandAction";

export class CommandAction implements ICommandAction {
    private id: string;
    private pluginId: string;
    private conditionId: string;

    constructor(id: string, pluginId: string, conditionId?: string) {
        this.id = id;
        this.pluginId = pluginId;
        this.conditionId = conditionId;
    }

    getId(): string {
        return this.id;
    }
    getPluginId(): string {
        return this.pluginId;
    }
    getConditionId(): string {
        return this.conditionId;
    }
}