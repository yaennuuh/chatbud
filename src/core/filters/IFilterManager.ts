import { IEvent } from "../events/IEvent";

export interface IFilterManager {
    loadFilters(): void;
    registerFilter(filterKeyword: string, functionInstance: any): void;
    getFilterKeyWords(): string[];
    applyFilter(filterKeyword: string, event: IEvent, originalEvent: IEvent): string;
}