import { EventTypeEnum } from "./events/EventTypeEnum";
import { IEvent } from "./events/IEvent";

export interface INotifiable {
    register(eventTypes: EventTypeEnum): EventTypeEnum[];
    execute(event: IEvent): void;
}