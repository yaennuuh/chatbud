import { expect } from 'chai';
import {FilterManager} from "../../src/core/filters/FilterManager";
import {Event} from "../../src/core/events/Event";
import {EventData} from "../../src/core/events/EventData";

class DummyFilter {

    register(): string {
        return "dummy";
    }

    getReplaceString(event: any): string {
        return 'genius';
    }
}

describe('FilterManager', () =>
{
    describe('test applyFilter', () =>
    {
        before(function() {
            let filterManager = FilterManager.getInstance();
            let dummy = new DummyFilter();
            filterManager.registerFilter(dummy.register(), dummy);
        });

        it('should replace $dummy with genius', () =>
        {
            let filterManager = FilterManager.getInstance();
            let event = new Event("someType", new EventData("this is $dummy, isn't it"));
            expect(filterManager.applyFilter("dummy", event))
                .to
                .eqls("this is genius, isn't it");
        });
        it('should replace $dummy with genius twice', () =>
        {
            let filterManager = FilterManager.getInstance();
            let event = new Event("someType", new EventData("this is $dummy, isn't it $dummy"));
            expect(filterManager.applyFilter("dummy", event))
                .to
                .eqls("this is genius, isn't it genius");
        });
    });

});
