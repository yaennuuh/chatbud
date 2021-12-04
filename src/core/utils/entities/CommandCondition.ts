import { ICommandCondition } from "./ICommandCondition";

export class CommandCondition implements ICommandCondition {
    private _id: string = '';
    private _pluginId: string = '';
    private _conditionFunction: string = '';
    private _fieldType: string = '';
    private _fieldTitle: string = '';
    private _fieldValue: string = '';
    private _fieldDataFunction: string = '';

    constructor(condition?: Object) {
        if (condition) {
            this.id = condition['id'];
            this.pluginId = condition['pluginId'];
            this.conditionFunction = condition['conditionFunction'];
            this.fieldType = condition['fieldType'];
            this.fieldTitle = condition['fieldTitle'];
            this.fieldValue = condition['fieldValue'];
            this.fieldDataFunction = condition['fieldDataFunction'];
        }
    }

    public fromDocument(document: Object): ICommandCondition {
        let commandCondition = new CommandCondition();
        commandCondition.id = document['id'];
        commandCondition.pluginId = document['pluginId'];
        commandCondition.conditionFunction = document['conditionFunction'];
        commandCondition.fieldType = document['fieldType'];
        commandCondition.fieldTitle = document['fieldTitle'];
        commandCondition.fieldValue = document['fieldValue'];
        commandCondition.fieldDataFunction = document['fieldDataFunction'];
        return commandCondition;
    }

    public toDocument(commandCondition: ICommandCondition): Object {
        let document = {};
        document['id'] = commandCondition.id;
        document['pluginId'] = commandCondition.pluginId;
        document['conditionFunction'] = commandCondition.conditionFunction;
        document['fieldType'] = commandCondition.fieldType;
        document['fieldTitle'] = commandCondition.fieldTitle;
        document['fieldValue'] = commandCondition.fieldValue;
        document['fieldDataFunction'] = commandCondition.fieldDataFunction;
        return document;
    }

    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    public get pluginId(): string {
        return this._pluginId;
    }
    public set pluginId(value: string) {
        this._pluginId = value;
    }
    public get conditionFunction(): string {
        return this._conditionFunction;
    }
    public set conditionFunction(value: string) {
        this._conditionFunction = value;
    }
    public get fieldType(): string {
        return this._fieldType;
    }
    public set fieldType(value: string) {
        this._fieldType = value;
    }
    public get fieldTitle(): string {
        return this._fieldTitle;
    }
    public set fieldTitle(value: string) {
        this._fieldTitle = value;
    }
    public get fieldValue(): string {
        return this._fieldValue;
    }
    public set fieldValue(value: string) {
        this._fieldValue = value;
    }
    public get fieldDataFunction(): string {
        return this._fieldDataFunction;
    }
    public set fieldDataFunction(value: string) {
        this._fieldDataFunction = value;
    }    
}