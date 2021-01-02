import { IEvent } from "../events/IEvent";

export interface IPluginHelper {
    sendEventToBusOut(event: IEvent): void;
    getOwnPluginApi(): any;
    pluginApiByName(pluginName: string): any;
    loadData(): any;
    saveData(data: any): void;
}
