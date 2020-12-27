export interface IPluginManager {
    loadCorePlugins(): void;
    loadPlugins(): void;
    loadConnectors(): void;
}