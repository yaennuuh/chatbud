import { IEventData } from "./IEventData";

export class EventData implements IEventData {
    message: string;
    
    constructor(message: string) {
        this.message = message;
    }
}