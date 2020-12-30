import { INotifiable } from "../INotifiable";
var PluginHelper = require("./PluginHelper");

export interface IPlugin extends INotifiable {
    pluginHelper: typeof PluginHelper;
    register(pluginHelper: typeof PluginHelper): string[];
}