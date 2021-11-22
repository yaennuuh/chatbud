import { IEvent } from "../events/IEvent";

export interface IPluginHelper {
    sendEventToBusOut(event: IEvent, originalEvent: IEvent): void;
    getOwnPluginApi(): any;
    pluginApiByName(pluginName: string): any;
    loadData(): any;
    testIntegration(): void;
    saveData(data: any): void;
}
