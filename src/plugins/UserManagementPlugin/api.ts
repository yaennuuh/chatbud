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

    isVIP = (event: IEvent, command: string, eventCommand: any, commandField: any): boolean => {
        return event.data.vip;
    }

    sleep = async(event: IEvent, command: string, eventCommand: any, commandField: any): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    usernameEquals = (event: IEvent, command: string, eventCommand: any, commandField: ICommandField): boolean => {
        return event.data.username === commandField.getValue();
    }

    logMessage = (event: IEvent, command: string, eventCommand: any, commandField: ICommandField): void => {
        console.log(commandField.getValue());
    }

    sendMessageAsStreamer = (event: IEvent, command: string, eventCommand: any, commandField: ICommandField): void => {
        this.plugin.sendMessageAsStreamer(commandField.getValue(), event);
    }

    sendMessageAsBot = (event: IEvent, command: string, eventCommand: any, commandField: ICommandField): void => {
        this.plugin.sendMessageAsBot(commandField.getValue(), event);
    }
}

module.exports = UserManagementPluginApi;