import { CoreBot } from "../CoreBot";
import { IEvent } from "../events/IEvent";
import { IPluginHelper } from "./IPluginHelper";
import * as YAML from 'yaml';
import * as fs from "fs";

export class PluginHelper implements IPluginHelper {

    sendEventToBusOut(event: IEvent): void {
        CoreBot.getInstance().notifyNotifiableOnEventBusOut(event);
    }

    loadData(filePath: string): any {
        if (fs.existsSync(filePath)) {
            const file = fs.readFileSync(filePath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }
    
    saveData(filePath: string, data: any): void {
        fs.writeFile(filePath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }
}