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
    before(function() {
        let filterManager = FilterManager.getInstance();
        let dummy = new DummyFilter();
        filterManager.registerFilter(dummy.register(), dummy);
    });
    describe('test registerFilter', () =>
    {
        before(function() {
            let filterManager = FilterManager.getInstance();
            let anotherDummy = new DummyFilter();
            filterManager.registerFilter("anotherDummy", anotherDummy);
        });
        it('should have two registered filters', () =>
        {
            let filterManager = FilterManager.getInstance();
            expect(filterManager.filterMap.size)
                .to
                .eql(2);
        });
    });
    describe('test applyFilter', () =>
    {
        it('should replace $dummy with genius', () =>
        {
            let filterManager = FilterManager.getInstance();
            let event = new Event("someType", new EventData("this is $dummy, isn't it"));
            expect(filterManager.applyFilter("dummy", event, event))
                .to
                .eqls("this is genius, isn't it");
        });
        it('should replace $dummy with genius twice', () =>
        {
            let filterManager = FilterManager.getInstance();
            let event = new Event("someType", new EventData("this is $dummy, isn't it $dummy"));
            expect(filterManager.applyFilter("dummy", event, event))
                .to
                .eqls("this is genius, isn't it genius");
        });
    });
    describe('test getFilterKeyWords', () =>
    {
        before(function() {
            let filterManager = FilterManager.getInstance();
            let anotherDummy = new DummyFilter();
            filterManager.registerFilter("anotherDummy", anotherDummy);
        });
        it('should return all filter keywords', () =>
        {
            let filterManager = FilterManager.getInstance();
            expect(filterManager.getFilterKeyWords())
                .to
                .eqls(['dummy', 'anotherDummy']);
        });
    });
});
