import { IFilterManager } from "./IFilterManager";
import { glob } from 'glob';
import * as _ from 'lodash';
import { IEvent } from "../events/IEvent";
import { CoreHelper } from "../CoreHelper";
import { npmInstallAsync  } from 'runtime-npm-install';
import * as fs from 'fs';
import * as YAML from 'yaml';

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
    
    unloadFilters(): void {
        this.filterMap = new Map();
    }

    loadFilters(): void {
        const files: string[] = glob.sync(`${this.resourcesPath}/**/filter.js`, null);
        _.each(files, (file) => {
            this.installDependency(file);
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

    private async installDependency(functionPath: string) {
        const path = functionPath.slice(0, -9);
        const configPath = path + 'config.yaml';
        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8');
            const config = YAML.parse(file);
            if (fs.existsSync(path)) {
                await npmInstallAsync(config.dependencies, path);
            }
        }
    }
}