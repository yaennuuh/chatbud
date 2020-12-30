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

    private constructor() {}

    static getInstance(): PluginManager {
        if (this.instance == null) {
            this.instance = new PluginManager();
        }
        return this.instance;
    }

    loadCorePlugins(): void {
        throw new Error("Method not implemented.");
    }

    loadPlugins(): void {
        const configFiles: string[] = glob.sync(__dirname + "/../../plugins/**/config.yaml", null);
        _.each(configFiles, (configPath) => {
            let pluginPath = configPath.substring(0, configPath.length - 11);
            if (fs.existsSync(configPath)) {
                const file = fs.readFileSync(configPath, 'utf8')
                const parsedConfig = YAML.parse(file);

                this.loadPlugin(parsedConfig, pluginPath);
                this.loadPluginApi(parsedConfig, pluginPath);
            }
        });
    }

    loadPlugin(config: any, pluginPath: string): void {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('plugin-js')
        ) {
            if (fs.existsSync(`${pluginPath}/${config['plugin-js']}`)) {
                const CustomPlugin = require(`${pluginPath}/${config['plugin-js']}`);
                const customPluginInstance = new CustomPlugin();

                const eventTypesToRegister: string[] = customPluginInstance.register(new PluginHelper(config));
                CoreBot.getInstance().registerPluginToEventBusIn(customPluginInstance, eventTypesToRegister);
            }
        }
    }

    getPluginApiByName(pluginName: string): any {
        return this.pluginApi.get(pluginName);
    }

    loadPluginApi(config: any, pluginPath: string): void {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('plugin-api-js')
        ) {
            if (fs.existsSync(`${pluginPath}/${config['plugin-api-js']}`)) {
                const CustomPluginApi = require(`${pluginPath}/${config['plugin-api-js']}`);
                const customPluginApiInstance = new CustomPluginApi();

                this.pluginApi.set(config['name'], customPluginApiInstance);
            }
        }
    }
}