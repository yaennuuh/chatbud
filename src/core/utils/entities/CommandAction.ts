import { ICommandAction } from "./ICommandAction";

export class CommandAction implements ICommandAction {
    private id: string;
    private pluginId: string;
    private functionName: string;
    private fieldId: string;
    private requiredConditions: string[];

    constructor(id: string, pluginId: string, functionName: string, fieldId?: string, requiredConditions?: string[]) {
        this.id = id;
        this.pluginId = pluginId;
        this.functionName = functionName;
        this.fieldId = fieldId;
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
    getFunctionName(): string {
        return this.functionName;
    }
    getFieldId(): string {
        return this.fieldId;
    }
}