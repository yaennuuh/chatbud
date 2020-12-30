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

    sendEventToBusOut(event: IEvent): void {
        CoreBot.getInstance().notifyNotifiableOnEventBusOut(event);
    }

    getOwnPluginApi(): any {
        return PluginManager.getInstance().getPluginApiByName(this.config['name']);
    }

    pluginApiByName(pluginName: string): any {
        return PluginManager.getInstance().getPluginApiByName(pluginName);
    }

    loadData(): any {
        let dataPath = `${__dirname}/../../plugins/${this.config['name']}/${this.config['data-yaml']}`;
        if (fs.existsSync(dataPath)) {
            const file = fs.readFileSync(dataPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }
    
    saveData(data: any): void {
        let dataPath = `${__dirname}/../../plugins/${this.config['name']}/${this.config['data-yaml']}`;
        fs.writeFile(dataPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }
}
module.exports = PluginHelper;