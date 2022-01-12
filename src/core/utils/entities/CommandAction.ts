import { ICommandAction } from "./ICommandAction";

export class CommandAction implements ICommandAction {
    private _id: string = '';
    private _pluginId: string = '';
    private _platform: string = '';
    private _actionFunction: string = '';
    private _order: number = 0;
    private _fieldType: string = '';
    private _fieldTitle: string = '';
    private _fieldValue: string = '';
    private _fieldDataFunction: string = '';
    private _requiredConditionFunctions: string[] = [];
    private _customId: string = '';

    constructor(action?: Object) {
        if (action) {
            this.id = action['id'];
            this.pluginId = action['pluginId'];
            this._platform = action['platform'];
            this.actionFunction = action['actionFunction'];
            this.order = action['order'];
            this.fieldType = action['fieldType'];
            this.fieldTitle = action['fieldTitle'];
            this.fieldValue = action['fieldValue'];
            this.fieldDataFunction = action['fieldDataFunction'];
            this.requiredConditionFunctions = action['requiredConditionFunctions'];
            this.customId = action['customId'];
        }
    }

    public fromDocument(document: Object): ICommandAction {
        let commandAction = new CommandAction();
        commandAction.id = document['id'];
        commandAction.pluginId = document['pluginId'];
        commandAction.platform = document['platform'];
        commandAction.actionFunction = document['actionFunction'];
        commandAction.order = document['order'];
        commandAction.fieldType = document['fieldType'];
        commandAction.fieldTitle = document['fieldTitle'];
        commandAction.fieldValue = document['fieldValue'];
        commandAction.fieldDataFunction = document['fieldDataFunction'];
        commandAction.requiredConditionFunctions = document['requiredConditionFunctions'];
        commandAction.customId = document['customId'];
        return commandAction;
    }

    public toDocument(commandAction: ICommandAction): Object {
        let document = {};
        document['id'] = commandAction.id;
        document['pluginId'] = commandAction.pluginId;
        document['platform'] = commandAction.platform;
        document['actionFunction'] = commandAction.actionFunction;
        document['order'] = commandAction.order;
        document['fieldType'] = commandAction.fieldType;
        document['fieldTitle'] = commandAction.fieldTitle;
        document['fieldValue'] = commandAction.fieldValue;
        document['fieldDataFunction'] = commandAction.fieldDataFunction;
        document['requiredConditionFunctions'] = commandAction.requiredConditionFunctions;
        document['customId'] = commandAction.customId;
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

    public get platform(): string {
        return this._platform;
    }
    public set platform(value: string) {
        this._platform = value;
    }

    public get actionFunction(): string {
        return this._actionFunction;
    }
    public set actionFunction(value: string) {
        this._actionFunction = value;
    }

    public get order(): number {
        return this._order;
    }
    public set order(value: number) {
        this._order = value;
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
    
    public get requiredConditionFunctions(): string[] {
        return this._requiredConditionFunctions;
    }
    public set requiredConditionFunctions(value: string[]) {
        this._requiredConditionFunctions = value;
    }

    public get customId(): string {
        return this.customId;
    }
    public set customId(value: string) {
        this._customId = value;
    }
}