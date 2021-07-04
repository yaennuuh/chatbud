import { glob } from 'glob';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as YAML from 'yaml';
import { CoreBot } from '../CoreBot';
import { IPluginManager } from './IPluginManager';
import { PluginHelper } from './PluginHelper';
import { CoreHelper } from '../CoreHelper';
import { npmInstallAsync  } from 'runtime-npm-install';

export class PluginManager implements IPluginManager {
    private static instance: PluginManager;

    private pluginApi: Map<string, any> = new Map();
    private plugins: Map<string, any> = new Map();
    private pluginHelpers: Map<string, any> = new Map();

    resourcesPath: string;
    resourcesPathCore: string;

    private constructor() {
        this.resourcesPathCore = `${__dirname}/../../plugins`;
    }

    public static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        PluginManager.instance.resourcesPath = CoreHelper.getInstance().getResourcesPath('plugins');

        return PluginManager.instance;
    }

    public loadCorePlugins(): void {
        this.loadAllPlugins(this.resourcesPathCore);
    }

    public loadPlugins(): void {
        this.loadAllPlugins(this.resourcesPath);
    }

    getAllCommandsConfigs = (): any[] => {
        let corePluginConfigs = this._getPluginsConfigs(this.resourcesPathCore);
        let customPluginConfigs = this._getPluginsConfigs(this.resourcesPath);

        let commandConfigs = [];
        _.each(_.concat(corePluginConfigs, customPluginConfigs), (config) => {
            if (config.hasOwnProperty('command')) {
                commandConfigs.push({
                    plugin: config.name,
                    command: config.command
                });
            }
        });

        return commandConfigs;
    }

    private async loadAllPlugins(basePath: string) {
        await this.installAllPluginDependencies(this.resourcesPath);
        const configs = this._getPluginsConfigs(basePath);
        _.each(configs, (config) => {
            this.loadPlugin(basePath, config);
            this.pluginApi.set(config['name'], this.loadPluginApi(basePath, config));
        });
    }

    private async installAllPluginDependencies(basePath: string): Promise<any> {
        const configs = this._getPluginsConfigs(basePath);
        _.each(configs, async (config) => {
            await this.installPluginDependency(basePath, config);
        });
        return Promise.resolve();
    }

    private _getPluginsConfigs = (basePath: string): any[] => {
        const configFiles: string[] = glob.sync(`${basePath}/**/config.yaml`, null);
        return _.map(configFiles, (configPath) => {
            if (fs.existsSync(configPath)) {
                const file = fs.readFileSync(configPath, 'utf8')
                return YAML.parse(file);
            }
        });
    }

    public loadPlugin(basePath: string, config: any) {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('plugin-js') &&
            !this.plugins.has(config['name'])
        ) {
            var pluginPath = `${basePath}/${config['name']}/${config['plugin-js']}`;
            if (fs.existsSync(pluginPath)) {
                const CustomPlugin = require(pluginPath);
                const customPluginInstance = new CustomPlugin();

                this.plugins.set(config['name'], customPluginInstance);
                const eventTypesToRegister: string[] = customPluginInstance.register(new PluginHelper(config));
                CoreBot.getInstance().registerPluginToEventBusIn(customPluginInstance, eventTypesToRegister);
            }
        }
    }

    public async installPluginDependency(basePath: string, config: any) {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('dependencies')
        ) {
            var pluginPath = `${basePath}/${config['name']}`;
            if (fs.existsSync(pluginPath)) {
                await npmInstallAsync(config.dependencies, pluginPath);
            }
        }
    }

    getPluginHelper = (config: any): any => {
        if (this.pluginHelpers.has(config['name'])) {
            return this.pluginHelpers.get(config['name']);
        }
        const tempPluginHelper = new PluginHelper(config);
        this.pluginHelpers.set(config['name'], tempPluginHelper);
        return tempPluginHelper;
    }

    public getPluginApiByName(pluginName: string): any {
        // TODO: check later if still not needed and delete
        // if (!this.plugins || this.plugins.size == 0) {
        //     this.loadPlugins();
        // }
        return this.pluginApi.get(pluginName);
    }

    public loadPluginApi(basePath: string, config: any): any {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('plugin-api-js') &&
            !this.pluginApi.has(config['name'])
        ) {
            var pluginApiPath = `${basePath}/${config['name']}/${config['plugin-api-js']}`;
            if (fs.existsSync(pluginApiPath)) {
                const CustomPluginApi = require(pluginApiPath);
                const customPluginApiInstance = new CustomPluginApi(this.plugins.get(config['name']));
                return customPluginApiInstance;
            }
        }
    }
}