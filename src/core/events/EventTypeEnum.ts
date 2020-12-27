import { EventType } from "./EventType";
import { IEvent } from "./IEvent";
import { IEventType } from "./IEventType";
import * as _ from 'lodash';


export enum EventTypeEnum {
    CUSTOM = 'custom',
    SPECIAL = 'special'
}

export function getEventTypeList(eventTypes: EventTypeEnum[]): IEventType[] {
    const eventTypesList: IEventType[] = [];
    _.each(eventTypes, (eventType: EventTypeEnum) => {
        eventTypesList.push(new EventType(eventType));
    });
    return eventTypesList;
}

export function getEventType(eventTypeEnum: EventTypeEnum): IEventType {
    return new EventType(eventTypeEnum);
}