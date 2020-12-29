import { expect } from 'chai';
import {FilterManager} from "../../src/core/filters/FilterManager";
import {Event} from "../../src/core/events/Event";
import {EventData} from "../../src/core/events/EventData";
const usernameFilterClass = require("../../src/filters/usernameFilter/filter");

describe('UsernameFilter', () =>
{
    describe('test replace string', () =>
    {
        before(function() {
            let filterManager = FilterManager.getInstance();
            let usernameFilter = new usernameFilterClass();
            filterManager.registerFilter(usernameFilter.register(), usernameFilter);
        });

        it('should replace $username', () =>
        {
            let filterManager = FilterManager.getInstance();
            let event = new Event("someType", new EventData("hi $username"));
            expect(filterManager.applyFilter("username", event))
                .to
                .eqls("hi barrex");
        });
        it('should replace $username twice', () =>
        {
            let filterManager = FilterManager.getInstance();
            let event = new Event("someType", new EventData("hi $username, how are you $username?"));
            expect(filterManager.applyFilter("username", event))
                .to
                .eqls("hi barrex, how are you barrex?");
        });
    });

});
