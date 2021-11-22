import { IPluginHelper } from "./IPluginHelper";

export interface IPluginManager {
    unloadAllPlugins(): void;
    loadCorePlugins(): void;
    loadPlugins(): void;
    getPluginHelper(config: any): IPluginHelper;
    getPluginHelperByName(name: string): IPluginHelper;
    loadPluginHelper(config: any): void;
}