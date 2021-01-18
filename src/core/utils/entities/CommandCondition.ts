import { ICommandCondition } from "./ICommandCondition";

export class CommandCondition implements ICommandCondition {
    private id: string;
    private pluginId: string;

    constructor(id: string, pluginId: string) {
        this.id = id;
        this.pluginId = pluginId;
    }

    getId(): string {
        return this.id;
    }
    getPluginId(): string {
        return this.pluginId;
    }
    
}