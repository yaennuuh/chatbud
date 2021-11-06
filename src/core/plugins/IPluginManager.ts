export interface IPluginManager {
    unloadAllPlugins(): void;
    loadCorePlugins(): void;
    loadPlugins(): void;
}