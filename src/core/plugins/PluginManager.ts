import { glob } from 'glob';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as YAML from 'yaml';
import { CoreBot } from '../CoreBot';
import { IPluginManager } from './IPluginManager';
import { PluginHelper } from './PluginHelper';
import { CoreHelper } from '../CoreHelper';

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

    private loadAllPlugins(basePath: string) {
        const configFiles: string[] = glob.sync(`${basePath}/**/config.yaml`, null);
        _.each(configFiles, (configPath) => {
            if (fs.existsSync(configPath)) {
                const file = fs.readFileSync(configPath, 'utf8')
                const parsedConfig = YAML.parse(file);

                this.loadPlugin(basePath, parsedConfig);
                this.pluginApi.set(parsedConfig['name'], this.loadPluginApi(basePath, parsedConfig));
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