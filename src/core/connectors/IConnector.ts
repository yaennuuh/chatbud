import { CoreBot } from "../CoreBot";
import { INotifiable } from "../INotifiable";

export interface IConnector extends INotifiable {
    coreBot: CoreBot;
    start(): void;
}