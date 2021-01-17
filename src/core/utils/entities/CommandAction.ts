import { ICommandAction } from "./ICommandAction";

export class CommandAction implements ICommandAction {
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