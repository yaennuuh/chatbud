import { Event } from "../../core/events/Event";
import { EventData } from "../../core/events/EventData";
import { IEvent } from "../../core/events/IEvent";
import { IPlugin } from "../../core/plugins/IPlugin";
import { PluginHelper } from "../../core/plugins/PluginHelper";

class DummyPlugin implements IPlugin {
    pluginHelper: PluginHelper;
    data: any;

    register(pluginHelper: PluginHelper) {
        this.pluginHelper = pluginHelper;
        return ['dummy-chat-message'];
    }

    execute(event: IEvent) {
        let eventData = new EventData("[#loop 2]something [#loop 2]nix [/#loop][/#loop][#if $username == $username]dfsdfsfds[#else]asd[/#if] matching wait [#wait 5] not matching [/#wait] [#wait 2] matching wait [/#wait] sdfdsf[#if user == zwei] zweites if [#else] zweites else [/#if]");
        this.pluginHelper.sendEventToBusOut(new Event('dummy-chat-message', eventData));
    }

    getDummy(): string {
        return 'dummy';
    }
}

module.exports = DummyPlugin;