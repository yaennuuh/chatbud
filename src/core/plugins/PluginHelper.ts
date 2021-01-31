import { CoreBot } from "../CoreBot";
import { IEvent } from "../events/IEvent";
import { IPluginHelper } from "./IPluginHelper";
import * as YAML from 'yaml';
import * as fs from "fs";
import { PluginManager } from "./PluginManager";
import {LoggerHelper} from "../utils/LoggerHelper";
import { UserManagementHelper } from '../utils/UserManagementHelper';
import { CooldownHelper } from '../utils/CooldownHelper';
import { CommandManagementHelper } from "../utils/CommandManagementHelper";
import { DatabaseHelper } from "../utils/DatabaseHelper";
import fetch from 'node-fetch';

export class PluginHelper implements IPluginHelper {

    constructor(private config: any) {
    }

    sendEventToBusOut = (event: IEvent) => {
        CoreBot.getInstance().notifyNotifiableOnEventBusOut(event);
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

    getCooldownHelper = (): CooldownHelper => {
        return CooldownHelper.getInstance();
    }

    pluginApiByName = (pluginName: string): any => {
        return PluginManager.getInstance().getPluginApiByName(pluginName);
    }

    loadData = (): any => {
        let dataPath = `${PluginManager.getInstance().resourcesPath}/${this.config['name']}/${this.config['data-yaml']}`;
        if (fs.existsSync(dataPath)) {
            const file = fs.readFileSync(dataPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }

    saveData = (data: any): void => {
        let dataPath = `${PluginManager.getInstance().resourcesPath}/${this.config['name']}/${this.config['data-yaml']}`;
        fs.writeFile(dataPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }

    getLogger = (): void => {
        LoggerHelper.getLogger(this.config['name']);
    }
}
