import { CoreBot } from "../CoreBot";
import { IEvent } from "../events/IEvent";
import { IPluginHelper } from "./IPluginHelper";
import * as YAML from 'yaml';
import * as fs from "fs";
import { PluginManager } from "./PluginManager";
import {LoggerHelper} from "../utils/LoggerHelper";

export class PluginHelper implements IPluginHelper {
    resourcesPath: string;
    pluginManager: PluginManager;

    constructor(private config: any) {
        this.pluginManager = PluginManager.getInstance();
    }

    sendEventToBusOut = (event: IEvent) => {
        CoreBot.getInstance().notifyNotifiableOnEventBusOut(event);
    }

    getOwnPluginApi = (): any => {
        return this.pluginApiByName(this.config['name']);
    }

    pluginApiByName = (pluginName: string): any => {
        return this.pluginManager.getPluginApiByName(pluginName);
    }

    loadData = (): any => {
        let dataPath = `${this.pluginManager.resourcesPath}/${this.config['name']}/${this.config['data-yaml']}`;
        if (fs.existsSync(dataPath)) {
            const file = fs.readFileSync(dataPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }

    saveData = (data: any): void => {
        let dataPath = `${this.pluginManager.resourcesPath}/${this.config['name']}/${this.config['data-yaml']}`;
        fs.writeFile(dataPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }

    getLogger = (): void => {
        LoggerHelper.getLogger(this.config['name']);
    }
}
