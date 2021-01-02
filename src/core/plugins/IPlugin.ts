import { INotifiable } from "../INotifiable";
import { PluginHelper } from "./PluginHelper";
import {Logger} from "@tsed/logger";

export interface IPlugin extends INotifiable {
    pluginHelper: PluginHelper;
    register(pluginHelper: PluginHelper, logger?: Logger): string[];
}
