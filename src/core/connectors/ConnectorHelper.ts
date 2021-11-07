import * as YAML from 'yaml';
import * as fs from "fs";
import { ConnectorManager } from "./ConnectorManager";
import { IConnectorHelper } from "./IConnectorHelper";
import { CoreBot } from '../CoreBot';
import { IEvent } from '../events/IEvent';
import { Event } from '../events/Event';
import { EventData } from '../events/EventData';
import { app } from 'electron';

export class ConnectorHelper implements IConnectorHelper {
    config: any;
    private dataPathFolder = `${app.getPath('userData')}/configs`;
    private dataPath = `${this.dataPathFolder}/connector-config.yaml`;

    constructor(config: any) {
        this.config = config;
    }

    notifyPluginsOnEventBusIn = (event: IEvent): void => {
        CoreBot.getInstance().notifyPluginsOnEventBusIn(event);
    }

    getEmptyEvent = (): IEvent => {
        return new Event('', new EventData(''));
    }

    getOwnConnectorApi = (connectorName?: string): any => {
        return ConnectorManager.getInstance().getConnectorApiByName(connectorName ? connectorName : this.config['name']);
    }

    getOwnName = (): string => {
        return this.config['name'];
    }

    loadData = (): any => {
        const configPath = `${this.dataPathFolder}/${this.config['name']}-config.yaml`;
        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8')
            return YAML.parse(file);
        }
        return YAML.parse('');
    }

    saveData = (data: any): void => {
        const configPath = `${this.dataPathFolder}/${this.config['name']}-config.yaml`;
        fs.writeFile(configPath, YAML.stringify(data), function (err) {
            if (err) throw err;
        });
    }

    createFolderIfNotExists() {
        if (!fs.existsSync(this.dataPathFolder)) {
            fs.mkdirSync(this.dataPathFolder);
        }
    }
}