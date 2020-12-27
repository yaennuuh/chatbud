import { EventTypeEnum } from "../../core/events/EventTypeEnum";
import { IEvent } from "../../core/events/IEvent";
import { IEventData } from "../../core/events/IEventData";
import { IPlugin } from "../../core/plugins/IPlugin";

class TestPlugin implements IPlugin {

    register() {
        return ['core-custom', 'core-special'];
    }

    execute(event: IEvent) {
        switch (event.type) {
            case 'core-custom':
                this.handleCustomEvents(event.data);
                break;
            case 'core-special':
                this.handleSpecialEvents(event.data);
                break;
        
            default:
                break;
        }
    }

    handleSpecialEvents(eventData: IEventData) {
        console.log('special event:', eventData.message);
    }

    handleCustomEvents(eventData: IEventData) {
        console.log('custom event:', eventData.message);
    }
}

module.exports = TestPlugin;