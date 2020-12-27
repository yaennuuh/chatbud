import { IEvent } from "./events/IEvent";

export interface INotifiable {
    execute(event: IEvent): void;
}