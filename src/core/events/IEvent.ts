import { IEventData } from "./IEventData";
import { IEventType } from "./IEventType";

export interface IEvent {
    type: IEventType;
    data: IEventData;
}