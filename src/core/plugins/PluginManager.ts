import { glob } from 'glob';
import * as _ from 'lodash';
import { CoreBot } from '../CoreBot';
import { EventTypeEnum, getEventTypeList } from '../events/EventTypeEnum';
import { IEventType } from '../events/IEventType';
import { IPluginManager } from './IPluginManager';

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
            const eventTypesToRegister: string[] = customPluginInstance.register(EventTypeEnum);
            // check if function registerOut if yes, register to out bus
            CoreBot.getInstance().registerPluginToEventBusIn(customPluginInstance, eventTypesToRegister);
        });
    }
    loadConnectors(): void {
        const files: string[] = glob.sync(__dirname + "/../../connectors/**/connector.js", null);
        _.each(files, (file) => {
            const CustomConnector = require(file);
            const customConnectorInstance = new CustomConnector();
            // Check if API exists
            // this.pluginApi.set('pluginname-from-config.json', new CustomConnectorApi(customConnectorInstance));
            // END Check if API exists
            const eventTypesToRegister: string[] = customConnectorInstance.register(EventTypeEnum);
            CoreBot.getInstance().registerNotifiableToEventBusOut(customConnectorInstance, eventTypesToRegister);
            customConnectorInstance.start();
        });
    };
}