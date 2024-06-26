import { CoreBot } from "../CoreBot";
import { IEvent } from "../events/IEvent";
import { IPluginHelper } from "./IPluginHelper";
import * as YAML from 'yaml';
import * as fs from "fs";
import { PluginManager } from "./PluginManager";
import {LoggerHelper} from "../utils/LoggerHelper";
import { UserManagementHelper } from '../utils/UserManagementHelper';
import { CommandManagementHelper } from "../utils/CommandManagementHelper";
import { DatabaseHelper } from "../utils/DatabaseHelper";
import fetch from 'node-fetch';
import { ConnectorManager } from "../connectors/ConnectorManager";

export class PluginHelper implements IPluginHelper {

    constructor(private config: any) {
    }

    sendEventToBusOut = async (event: IEvent, originalEvent: IEvent): Promise<void> => {
        await CoreBot.getInstance().notifyNotifiableOnEventBusOut(event, originalEvent);
    }

    getOwnPluginApi = (): any => {
        return this.pluginApiByName(this.config['name']);
    }

    getUserManagementHelper = (): UserManagementHelper => {
        return UserManagementHelper.getInstance();
    }

    getDatabase = (): any => {
        return DatabaseHelper.getInstance().getDatabase(this.config['name']);
    }

    getFetch = (): any => {
        return fetch;
    }

    getCommandManagementHelper = (): CommandManagementHelper => {
        return CommandManagementHelper.getInstance();
    }

    pluginApiByName = (pluginName: string): any => {
        return PluginManager.getInstance().getPluginApiByName(pluginName);
    }

    getConnectorApiByName = (connectorName: string): any => {
        return ConnectorManager.getInstance().getConnectorApiByName(connectorName);
    }

    loadData = (): any => {
        let dataPath = `${PluginManager.getInstance().resourcesPath}/${this.config['name']}/data.yaml`;
        if (fs.existsSync(dataPath)) {
            const file = fs.readFileSync(dataPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }

    saveData = (data: any): void => {
        let dataPath = `${PluginManager.getInstance().resourcesPath}/${this.config['name']}/data.yaml`;
        fs.writeFile(dataPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }

    getLogger = (): void => {
        LoggerHelper.getLogger(this.config['name']);
    }
}
