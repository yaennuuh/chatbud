import { glob } from 'glob';
import * as _ from 'lodash';
import { CoreBot } from '../CoreBot';
import { IPluginManager } from './IPluginManager';
import * as fs from 'fs';
import * as YAML from 'yaml';
var PluginHelper = require('./PluginHelper');

export class PluginManager implements IPluginManager {
    private static instance: PluginManager;

    pluginApi: Map<string, any> = new Map();
    plugins: Map<string, any> = new Map();

    private constructor() { }

    public static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }

    public loadCorePlugins(): void {
        throw new Error("Method not implemented.");
    }

    public loadPlugins(ui: boolean): void {
        const configFiles: string[] = glob.sync(__dirname + "/../../plugins/**/config.yaml", null);
        _.each(configFiles, (configPath) => {
            if (fs.existsSync(configPath)) {
                const file = fs.readFileSync(configPath, 'utf8')
                const parsedConfig = YAML.parse(file);

                this.loadPlugin(parsedConfig, ui);
                this.pluginApi.set(parsedConfig['name'], this.loadPluginApi(parsedConfig));
            }
        });
    }

    public loadPluginConfigByName(pluginName: string): any {
        const configFiles: string[] = glob.sync(`${__dirname}/../../plugins/${pluginName}/config.yaml`, null);
        if (fs.existsSync(configFiles[0])) {
            const file = fs.readFileSync(configFiles[0], 'utf8')
            const parsedConfig = YAML.parse(file);
            return parsedConfig;
        }
        return YAML.parse('');
    }

    public loadPlugin(config: any, ui: boolean) {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('plugin-js')
        ) {
            var pluginPath = `${__dirname}/../../plugins/${config['name']}/${config['plugin-js']}`;
            if (fs.existsSync(pluginPath)) {
                const CustomPlugin = require(pluginPath);
                const customPluginInstance = new CustomPlugin();

                this.plugins.set(config['name'], customPluginInstance);
                if (!ui) {
                    const eventTypesToRegister: string[] = customPluginInstance.register(new PluginHelper(config));
                    CoreBot.getInstance().registerPluginToEventBusIn(customPluginInstance, eventTypesToRegister);
                }
            }
        }
    }

    public getPluginApiByName(pluginName: string): any {
        if(!this.plugins || this.plugins.size == 0) {
            this.loadPlugins(true);
        }
        return this.pluginApi.get(pluginName);
    }

    public loadPluginApi(config: any): any {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('plugin-api-js')
        ) {
            var pluginApiPath = `${__dirname}/../../plugins/${config['name']}/${config['plugin-api-js']}`;
            if (fs.existsSync(pluginApiPath)) {
                const CustomPluginApi = require(pluginApiPath);
                const customPluginApiInstance = new CustomPluginApi(this.plugins.get(config['name']));
                return customPluginApiInstance;
            }
        }
    }
}