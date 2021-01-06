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

    pluginApi: Map<string, any> = new Map();
    plugins: Map<string, any> = new Map();
    pluginHelpers: Map<string, any> = new Map();

    resourcesPath: string;

    private constructor() { }

    public static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        
        PluginManager.instance.resourcesPath = CoreHelper.getInstance().getResourcesPath('plugins');

        return PluginManager.instance;
    }

    public loadCorePlugins(): void {
        throw new Error("Method not implemented.");
    }

    public loadPlugins(): void {
        const configFiles: string[] = glob.sync(`${this.resourcesPath}/**/config.yaml`, null);
        _.each(configFiles, (configPath) => {
            if (fs.existsSync(configPath)) {
                const file = fs.readFileSync(configPath, 'utf8')
                const parsedConfig = YAML.parse(file);

                this.loadPlugin(parsedConfig);
                this.pluginApi.set(parsedConfig['name'], this.loadPluginApi(parsedConfig));
            }
        });
    }

    public loadPluginConfigByName(pluginName: string): any {
        const configFiles: string[] = glob.sync(`${this.resourcesPath}/${pluginName}/config.yaml`, null);
        if (fs.existsSync(configFiles[0])) {
            const file = fs.readFileSync(configFiles[0], 'utf8')
            const parsedConfig = YAML.parse(file);
            return parsedConfig;
        }
        return YAML.parse('');
    }

    public loadPlugin(config: any) {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('plugin-js')
        ) {
            var pluginPath = `${this.resourcesPath}/${config['name']}/${config['plugin-js']}`;
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
        if (!this.plugins || this.plugins.size == 0) {
            this.loadPlugins();
        }
        return this.pluginApi.get(pluginName);
    }

    public loadPluginApi(config: any): any {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('plugin-api-js')
        ) {
            var pluginApiPath = `${this.resourcesPath}/${config['name']}/${config['plugin-api-js']}`;
            if (fs.existsSync(pluginApiPath)) {
                const CustomPluginApi = require(pluginApiPath);
                const customPluginApiInstance = new CustomPluginApi(this.plugins.get(config['name']));
                return customPluginApiInstance;
            }
        }
    }
}