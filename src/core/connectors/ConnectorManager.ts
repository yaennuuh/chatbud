import { glob } from 'glob';
import * as _ from 'lodash';
import { CoreBot } from '../CoreBot';
import { IConnectorManager } from './IConnectorManager';

export class ConnectorManager implements IConnectorManager {

    loadConnectors(): void {
        const files: string[] = glob.sync(__dirname + "/../../connectors/**/connector.js", null);
        _.each(files, (file) => {
            const CustomConnector = require(file);
            const customConnectorInstance = new CustomConnector();
            const eventTypesToRegister: string[] = customConnectorInstance.register();
            CoreBot.getInstance().registerNotifiableToEventBusOut(customConnectorInstance, eventTypesToRegister);
            customConnectorInstance.start();
        });
    };
}