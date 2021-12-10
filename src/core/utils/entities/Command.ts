import { CommandAction } from "./CommandAction";
import { CommandCondition } from "./CommandCondition";
import { CommandType } from "./CommandTypeEnum";
import { ICommand } from "./ICommand";
import { ICommandAction } from "./ICommandAction";
import { ICommandCondition } from "./ICommandCondition";

export class Command implements ICommand {
    private _id: string;
    private _commandType: CommandType = CommandType.COMMAND;
    private _command: string = '';
    private _active: boolean = true;
    private _actions: ICommandAction[] = [];
    private _conditions: ICommandCondition[] = [];
    private _description: string = '';

    constructor(command?: Object) {
        if (command) {
            this.id = command['_id'];
            this.commandType = command['commandType'];
            this.command = command['command'];
            this.active = command['active'];
            this.actions = command['actions'];
            this.conditions = command['conditions'];
            this.description = command['description'];
        }
    }

    public fromDocument(document: Object): ICommand {
        let command = new Command();
        command.id = document['_id'];
        command.commandType = document['commandType'];
        command.command = document['command'];
        command.active = document['active'];
        command.actions = document['actions'].map((action: Object) => new CommandAction(action));
        command.conditions = document['conditions'].map((condition: Object) => new CommandCondition(condition));
        command.description = document['description'];
        return command;
    }

    public toDocument(command: ICommand): Object {
        let document = {};
        document['_id'] = command.id;
        document['commandType'] = command.commandType;
        document['command'] = command.command;
        document['active'] = command.active;
        document['actions'] = command.actions;
        document['conditions'] = command.conditions;
        document['description'] = command.description;
        return document;
    }

    public addActionToCommand(action: ICommandAction): void {
        this._actions.push(action);
    }

    public addConditionToCommand(condition: ICommandCondition): void {
        this._conditions.push(condition);
    }

    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    public get commandType(): CommandType {
        return this._commandType;
    }
    public set commandType(value: CommandType) {
        this._commandType = value;
    }
    public get command(): string {
        return this._command;
    }
    public set command(value: string) {
        this._command = value;
    }
    public get active(): boolean {
        return this._active;
    }
    public set active(value: boolean) {
        this._active = value;
    }
    public get actions(): ICommandAction[] {
        return this._actions;
    }
    public set actions(value: ICommandAction[]) {
        this._actions = value;
    }
    public get conditions(): ICommandCondition[] {
        return this._conditions;
    }
    public set conditions(value: ICommandCondition[]) {
        this._conditions = value;
    }
    public get description(): string {
        return this._description;
    }
    public set description(value: string) {
        this._description = value;
    }
}