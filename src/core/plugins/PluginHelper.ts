import { CoreBot } from "../CoreBot";
import { IEvent } from "../events/IEvent";
import { IPluginHelper } from "./IPluginHelper";
import * as YAML from 'yaml';
import * as fs from "fs";
import { PluginManager } from "./PluginManager";

class PluginHelper implements IPluginHelper {
    config: any;
    test = 'test';

    constructor(config: any) {
        this.config = config;
    }

    sendEventToBusOut = function (event: IEvent): void {
        CoreBot.getInstance().notifyNotifiableOnEventBusOut(event);
    }

    getOwnPluginApi = function (): any {
        return PluginManager.getInstance().getPluginApiByName(this.config['name']);
    }

    pluginApiByName = function (pluginName: string): any {
        return PluginManager.getInstance().getPluginApiByName(pluginName);
    }

    loadData = function (): any {
        let dataPath = `${__dirname}/../../plugins/${this.config['name']}/${this.config['data-yaml']}`;
        if (fs.existsSync(dataPath)) {
            const file = fs.readFileSync(dataPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }
    
    saveData = function (data: any): void {
        let dataPath = `${__dirname}/../../plugins/${this.config['name']}/${this.config['data-yaml']}`;
        fs.writeFile(dataPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }
}
module.exports = PluginHelper;