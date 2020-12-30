export interface IPluginManager {
    loadCorePlugins(): void;
    loadPlugins(ui: boolean): void;
}