import { IEventType } from "./IEventType";

export class EventType implements IEventType {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    toKey(): string {
        return 'EventType-' + this.name;
    }
}