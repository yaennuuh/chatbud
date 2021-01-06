import { INotifiable } from "../INotifiable";
import { PluginHelper } from "./PluginHelper";

export interface IPlugin extends INotifiable {
    pluginHelper: PluginHelper;
    register(pluginHelper: PluginHelper): string[];
}
