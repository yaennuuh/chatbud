import { ICommandField } from "./ICommandField";

export class CommandField implements ICommandField {
    private id: string;
    private pluginId: string;
    private value: string;

    constructor(id: string, pluginId: string, value: string) {
        this.id = id;
        this.pluginId = pluginId;
        this.value = value;
    }

    getId(): string {
        return this.id;
    }
    getPluginId(): string {
        return this.pluginId;
    }
    getValue(): string {
        return this.value;
    }
    setValue(value: string): void {
        this.value = value;
    }
    
}