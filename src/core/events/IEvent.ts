import { IEventData } from "./IEventData";

export interface IEvent {
    type: string;
    data: IEventData;
}