import { IFilterManager } from "./IFilterManager";
import { glob } from 'glob';
import * as _ from 'lodash';
import { IEvent } from "../events/IEvent";
import { CoreHelper } from "../CoreHelper";

export class FilterManager implements IFilterManager {
    private static instance: FilterManager;

    filterMap: Map<string, any>;

    resourcesPath: string;

    private constructor() {
        this.filterMap = new Map();
    }

    static getInstance(): FilterManager {
        if (this.instance == null) {
            this.instance = new FilterManager();
        }
        
        FilterManager.instance.resourcesPath = CoreHelper.getInstance().getResourcesPath('filters');

        return this.instance;
    }

    loadFilters(): void {
        const files: string[] = glob.sync(`${this.resourcesPath}/**/filter.js`, null);
        _.each(files, (file) => {
            const CustomFilter = require(file);
            const customFilterInstance = new CustomFilter();
            this.registerFilter(customFilterInstance.register(), customFilterInstance);
        });
    };

    registerFilter(filterKeyword: string, functionInstance: any): void {
        this.filterMap.set(filterKeyword, functionInstance);
    }

    getFilterKeyWords(): string[] {
        return Array.from(this.filterMap.keys());
    }

    applyFilter(filterKeyword: string, event: IEvent, originalEvent: IEvent): string {
        const filterInstance: any = this.filterMap.get(filterKeyword);
        return event.data.message.split(`$${filterKeyword}`).join(filterInstance.getReplaceString(event, originalEvent));
    }
}