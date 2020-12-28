import { glob } from 'glob';
import * as _ from 'lodash';
import { CoreBot } from '../CoreBot';
import { IPluginManager } from './IPluginManager';
import { PluginHelper } from './PluginHelper';

export class PluginManager implements IPluginManager {
    pluginApi: Map<string, any> = new Map();

    loadCorePlugins(): void {
        throw new Error("Method not implemented.");
    }
    
    loadPlugins(): void {
        const files: string[] = glob.sync(__dirname + "/../../plugins/**/plugin.js", null);
        _.each(files, (file) => {
            const CustomPlugin = require(file);
            const customPluginInstance = new CustomPlugin();
            // Check if API exists
            // this.pluginApi.set('pluginname-from-config.json', new CustomPluginApi(customPluginInstance));
            // END Check if API exists
            const eventTypesToRegister: string[] = customPluginInstance.register(new PluginHelper());
            // check if function registerOut if yes, register to out bus
            CoreBot.getInstance().registerPluginToEventBusIn(customPluginInstance, eventTypesToRegister);
        });
    }
}