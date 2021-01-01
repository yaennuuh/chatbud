import { IEvent } from "./IEvent";
import { IEventData } from "./IEventData";

export class Event implements IEvent {
    type: string;
    data: IEventData;
    
    constructor(type: string, data: IEventData) {
        this.type = type;
        this.data = data;
    }

    setEventType = (type: string): void => {
        this.type = type;
    }
}