import * as _ from 'lodash';
import { expect } from 'chai';
import {IPlugin} from "../../src/core/plugins/IPlugin";
import {PluginHelper} from "../../src/core/plugins/PluginHelper";
import {IEvent} from "../../src/core/events/IEvent";
import {EventInBus} from "../../src/core/busses/EventInBus";
import {IBus} from "../../src/core/busses/IBus";

class DummyPlugin implements IPlugin {
    pluginHelper: PluginHelper;

    register(pluginHelper: PluginHelper) {
        return [];
    }

    execute(event: IEvent) {}
}

function setUpEventBus(eventTypes: string[], numberOfPlugins: number): IBus<IPlugin>{
    let bus = new EventInBus();
    _.each(eventTypes, (eventType: string) => {
        for (let i = 0; i < numberOfPlugins; i++) {
            bus.subscribe(new DummyPlugin(), [eventType]);
        }
    })
    return bus;
}

describe('EventInBus', () =>
{
    describe('test subscriber map', () =>
    {
        it('should have one keyword and one plugin within the subscription map', () =>
        {
            let eventInBus = setUpEventBus(['some-message'], 1);
            expect(eventInBus.subscribers.size)
                .to
                .eqls(1);
            expect(eventInBus.subscribers.get('some-message').length)
                .to
                .eqls(1);
        });
        it('should have one keyword and two plugins within the subscription map', () =>
        {
            let eventInBus = setUpEventBus(['some-message'], 2);
            expect(eventInBus.subscribers.size)
                .to
                .eqls(1);
            expect(eventInBus.subscribers.get('some-message').length)
                .to
                .eqls(2);
        });
        it('should have two keywords and one plugin on each keyword', () =>
        {
            let eventInBus = setUpEventBus(['some-message', 'other-message'], 1);
            expect(eventInBus.subscribers.size)
                .to
                .eqls(2);
            expect(eventInBus.subscribers.get('some-message').length)
                .to
                .eqls(1);
            expect(eventInBus.subscribers.get('other-message').length)
                .to
                .eqls(1);
        });
        it('should have two keywords and two plugins on each keyword', () =>
        {
            let eventInBus = setUpEventBus(['some-message', 'other-message'], 2);
            expect(eventInBus.subscribers.size)
                .to
                .eqls(2);
            expect(eventInBus.subscribers.get('some-message').length)
                .to
                .eqls(2);
            expect(eventInBus.subscribers.get('other-message').length)
                .to
                .eqls(2);
        });
        it('should not register the same instance twice on the same keyword', () =>
        {
            let eventInBus = new EventInBus();
            let dummyPlugin = new DummyPlugin();
            eventInBus.subscribe(dummyPlugin, ['some-message']);
            eventInBus.subscribe(dummyPlugin, ['some-message']);
            expect(eventInBus.subscribers.size)
                .to
                .eqls(1);
            expect(eventInBus.subscribers.get('some-message').length)
                .to
                .eqls(1);
        });
    });
    describe('test subscriber notification', () =>
    {
        let eventInBus = new EventInBus();
        before(function() {
            let dummyPlugin = new DummyPlugin();
            eventInBus.subscribe(dummyPlugin, ['*']);
            eventInBus.subscribe(dummyPlugin, ['dummy-test-message']);
            eventInBus.subscribe(dummyPlugin, ['dummy-test*']);
            eventInBus.subscribe(dummyPlugin, ['dummy-*']);
            eventInBus.subscribe(dummyPlugin, ['dummy-test-chat']);
            eventInBus.subscribe(dummyPlugin, ['d*']);
            eventInBus.subscribe(dummyPlugin, ['dummy-test']);
        });
        it('should notify 5 subscribers on dummy-test-message event', () =>
        {
            expect(eventInBus.subscribersToNotify("dummy-test-message"))
                .to
                .eqls(['*', 'dummy-test-message', 'dummy-test*', 'dummy-*', 'd*']);
        });
    });
});
