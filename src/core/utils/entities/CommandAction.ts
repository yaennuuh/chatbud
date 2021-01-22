import { ICommandAction } from "./ICommandAction";

export class CommandAction implements ICommandAction {
    private id: string;
    private pluginId: string;
    private requiredConditions: string[];

    constructor(id: string, pluginId: string, requiredConditions?: string[]) {
        this.id = id;
        this.pluginId = pluginId;
        this.requiredConditions = requiredConditions;
    }

    getId(): string {
        return this.id;
    }
    getPluginId(): string {
        return this.pluginId;
    }
    getRequiredConditions(): string[] {
        return this.requiredConditions;
    }
}