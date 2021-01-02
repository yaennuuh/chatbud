import { IEvent } from "../events/IEvent";
import {Logger} from "@tsed/logger";

export interface IPluginHelper {
    sendEventToBusOut(event: IEvent): void;
    getOwnPluginApi(): any;
    pluginApiByName(pluginName: string): any;
    loadData(): any;
    saveData(data: any): void;
    getLogger(category: string): Logger;
}