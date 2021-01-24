import { IEvent } from "../../core/events/IEvent";
import { ICommandField } from "../../core/utils/entities/ICommandField";

class UserManagementPluginApi {

    constructor(private plugin: any) {
    }

    isMod = (event: IEvent, eventCommand: any, commandField: any): boolean => {
        return event.data.mod;
    }

    isSubscriber = (event: IEvent, eventCommand: any, commandField: any): boolean => {
        return event.data.subscriber;
    }

    usernameEquals = (event: IEvent, eventCommand: any, commandField: ICommandField): boolean => {
        return event.data.username === commandField.getValue();
    }

    logMessage = (event: IEvent, eventCommand: any, commandField: ICommandField): void => {
        console.log(commandField.getValue());
    }
}

module.exports = UserManagementPluginApi;