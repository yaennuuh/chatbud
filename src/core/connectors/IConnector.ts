import { INotifiable } from "../INotifiable";

export interface IConnector extends INotifiable {
    start(): void;
    register(): string[];
}