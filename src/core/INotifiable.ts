import { IEvent } from "./events/IEvent";

export interface INotifiable {
    register(): string[];
    execute(event: IEvent): void;
}