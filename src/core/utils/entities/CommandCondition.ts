import { ICommandCondition } from "./ICommandCondition";

export class CommandCondition implements ICommandCondition {
    private id: string;
    private pluginId: string;
    private functionName: string;
    private fieldId: string;

    constructor(id: string, pluginId: string, functionName: string, fieldId?: string) {
        this.id = id;
        this.pluginId = pluginId;
        this.functionName = functionName;
        this.fieldId = fieldId;
    }

    getId(): string {
        return this.id;
    }
    getPluginId(): string {
        return this.pluginId;
    }
    getFunctionName(): string {
        return this.functionName;
    }
    getFieldId(): string {
        return this.fieldId;
    }
    
}