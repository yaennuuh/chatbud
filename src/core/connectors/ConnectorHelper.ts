import * as YAML from 'yaml';
import * as fs from "fs";
import { ConnectorManager } from "./ConnectorManager";
import { IConnectorHelper } from "./IConnectorHelper";
import { CoreBot } from '../CoreBot';
import { IEvent } from '../events/IEvent';
import { Event } from '../events/Event';
import { EventData } from '../events/EventData';

export class ConnectorHelper implements IConnectorHelper {
    config: any;

    constructor(config: any) {
        this.config = config;
    }

    notifyPluginsOnEventBusIn = (event: IEvent): void => {
        CoreBot.getInstance().notifyPluginsOnEventBusIn(event);
    }

    getEmptyEvent = (): IEvent => {
        return new Event('', new EventData(''));
    }

    getOwnConnectorApi = (): any => {
        return ConnectorManager.getInstance().getConnectorApiByName(this.config['name']);
    }

    loadData = (): any => {
        let dataPath = `${__dirname}/../../connectors/${this.config['name']}/${this.config['data-yaml']}`;
        if (fs.existsSync(dataPath)) {
            const file = fs.readFileSync(dataPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }

    saveData = (data: any): void => {
        let dataPath = `${__dirname}/../../connectors/${this.config['name']}/${this.config['data-yaml']}`;
        fs.writeFile(dataPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }
}