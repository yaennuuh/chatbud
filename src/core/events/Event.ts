import { IEvent } from "./IEvent";
import { IEventData } from "./IEventData";

export class Event implements IEvent {
    type: string;
    data: IEventData;
    message: string;
    
    constructor(type: string, data: IEventData, message?: string) {
        this.type = type;
        this.data = data;
        this.message = message;
    }

    setEventType = (type: string): void => {
        this.type = type;
    }
}