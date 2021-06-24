import { IEvent } from "../../core/events/IEvent";
import { ICommandField } from "../../core/utils/entities/ICommandField";

class UserManagementPluginApi {

    constructor(private plugin: any) {
    }

    isMod = (event: IEvent, command: string, eventCommand: any, commandField: any): boolean => {
        return event.data.mod;
    }

    isSubscriber = (event: IEvent, command: string, eventCommand: any, commandField: any): boolean => {
        return event.data.subscriber;
    }

    sleep = async(event: IEvent, command: string, eventCommand: any, commandField: any): Promise<void> => {
        console.log('freezeeee');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('END freezeeee');
    }

    usernameEquals = (event: IEvent, command: string, eventCommand: any, commandField: ICommandField): boolean => {
        return event.data.username === commandField.getValue();
    }

    logMessage = (event: IEvent, command: string, eventCommand: any, commandField: ICommandField): void => {
        console.log(commandField.getValue());
    }
}

module.exports = UserManagementPluginApi;