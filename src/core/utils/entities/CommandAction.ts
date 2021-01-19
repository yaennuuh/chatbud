import { ICommandAction } from "./ICommandAction";

export class CommandAction implements ICommandAction {
    private id: string;
    private pluginId: string;
    private conditions: string[];

    constructor(id: string, pluginId: string, conditions?: string[]) {
        this.id = id;
        this.pluginId = pluginId;
        this.conditions = conditions;
    }

    getId(): string {
        return this.id;
    }
    getPluginId(): string {
        return this.pluginId;
    }
    getConditions(): string[] {
        return this.conditions;
    }
}