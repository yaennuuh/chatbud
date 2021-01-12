import { glob } from 'glob';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as YAML from 'yaml';
import { CoreBot } from '../CoreBot';
import { ConnectorHelper } from './ConnectorHelper';
import { IConnectorManager } from './IConnectorManager';

export class ConnectorManager implements IConnectorManager {
    private static instance: ConnectorManager;

    connectorApi: Map<string, any> = new Map();
    connectors: Map<string, any> = new Map();
    connectorHelpers: Map<string, any> = new Map();

    private constructor() { }

    public static getInstance(): ConnectorManager {
        if (!ConnectorManager.instance) {
            ConnectorManager.instance = new ConnectorManager();
        }
        return ConnectorManager.instance;
    }

    public loadConnectors(): void {
        const configFiles: string[] = glob.sync(__dirname + "/../../connectors/**/config.yaml", null);
        _.each(configFiles, (configPath) => {
            if (fs.existsSync(configPath)) {
                const file = fs.readFileSync(configPath, 'utf8')
                const parsedConfig = YAML.parse(file);

                this.loadConnector(parsedConfig);
                this.connectorApi.set(parsedConfig['name'], this.loadConnectorApi(parsedConfig));
            }
        });
    }

    public loadConnectorConfigByName(connectorName: string): any {
        const configFiles: string[] = glob.sync(`${__dirname}/../../connectors/${connectorName}/config.yaml`, null);
        if (fs.existsSync(configFiles[0])) {
            const file = fs.readFileSync(configFiles[0], 'utf8')
            const parsedConfig = YAML.parse(file);
            return parsedConfig;
        }
        return YAML.parse('');
    }

    public loadConnector(config: any) {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('connector-js') &&
            !this.connectors.has(config['name'])
        ) {
            var connectorPath = `${__dirname}/../../connectors/${config['name']}/${config['connector-js']}`;
            if (fs.existsSync(connectorPath)) {
                const CustomConnector = require(connectorPath);
                const customConnectorInstance = new CustomConnector();

                this.connectors.set(config['name'], customConnectorInstance);
                const eventTypesToRegister: string[] = customConnectorInstance.register(new ConnectorHelper(config));
                CoreBot.getInstance().registerNotifiableToEventBusOut(customConnectorInstance, eventTypesToRegister);
                customConnectorInstance.start();
            }
        }
    }

    getConnectorHelper = (config: any): any => {
        if (this.connectorHelpers.has(config['name'])) {
            return this.connectorHelpers.get(config['name']);
        }
        const tempConnectorHelper = new ConnectorHelper(config);
        this.connectorHelpers.set(config['name'], tempConnectorHelper);
        return tempConnectorHelper;
    }

    public getConnectorApiByName(connectorName: string): any {
        if (!this.connectors || this.connectors.size == 0) {
            this.loadConnectors();
        }
        return this.connectorApi.get(connectorName);
    }

    public loadConnectorApi(config: any): any {
        if (config &&
            config.hasOwnProperty('name') &&
            config.hasOwnProperty('connector-api-js')
        ) {
            var connectorApiPath = `${__dirname}/../../connectors/${config['name']}/${config['connector-api-js']}`;
            if (fs.existsSync(connectorApiPath)) {
                const CustomConnectorApi = require(connectorApiPath);
                const customConnectorApiInstance = new CustomConnectorApi(this.connectors.get(config['name']));
                return customConnectorApiInstance;
            }
        }
    }
}