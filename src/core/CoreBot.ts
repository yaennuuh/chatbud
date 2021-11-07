import { EventInBus } from "./busses/EventInBus";
import { EventOutBus } from "./busses/EventOutBus";
import { IEvent } from "./events/IEvent";
import { ICoreBot } from "./ICoreBot";
import { INotifiable } from "./INotifiable";
import { IPlugin } from "./plugins/IPlugin";
import * as _ from 'lodash';
import { FunctionManager } from "./functions/FunctionManager";
import { FilterManager } from "./filters/FilterManager";

export class CoreBot implements ICoreBot {
    private static instance: CoreBot;
    private eventBusIn: EventInBus;
    private eventBusOut: EventOutBus;
    private functionManager: FunctionManager;
    private filterManager: FilterManager;

    private constructor() {
        this.eventBusIn = new EventInBus();
        this.eventBusOut = new EventOutBus();
        this.functionManager = FunctionManager.getInstance();
        this.filterManager = FilterManager.getInstance();
    }

    static getInstance(): CoreBot {
        if (this.instance == null) {
            this.instance = new CoreBot();
        }
        return this.instance;
    }

    /***
     * EVENT BUS IN
     */

    unregisterAllFromEventBusIn(): void {
        this.eventBusIn.unsubscribeAll();
    }

    registerPluginToEventBusIn(plugin: IPlugin, eventTypeList: string[]): void {
        this.eventBusIn.subscribe(plugin, eventTypeList);
    }

    notifyPluginsOnEventBusIn(event: IEvent): void {
        this.eventBusIn.notify(event);
    }

    /***
     * EVENT BUS OUT
     */

    unregisterAllFromEventBusOut(): void {
        this.eventBusOut.unsubscribeAll();
    }

    registerNotifiableToEventBusOut(notifiable: INotifiable, eventTypeList: string[]): void {
        this.eventBusOut.subscribe(notifiable, eventTypeList);
    }

    async notifyNotifiableOnEventBusOut(event: IEvent, originalEvent: IEvent): Promise<void> {
        let splittedMessage = originalEvent.data.message.split(' ');
        let commandResponse = (' ' + event.data.message).slice(1);
        for (let index = 1; index < splittedMessage.length; index++) {
            const element = splittedMessage[index];
            if (commandResponse.indexOf(`$${index}`) != -1) {
                commandResponse = commandResponse.split(`$${index}`).join(element);
            }
        }
        event.data.message = commandResponse;

        let filterKeywordList = this.filterManager.getFilterKeyWords();

        if (filterKeywordList && filterKeywordList.length) {
            _.each(filterKeywordList, (filterKeyword) => {
                if (event.data.message.indexOf(filterKeyword) != -1) {
                    event.data.message = this.filterManager.applyFilter(filterKeyword, event, originalEvent);
                }
            });
        }

        let functionKeywordList = this.functionManager.getFunctionKeyWords();

        if (functionKeywordList && functionKeywordList.length) {
            let packages: string[] = this.packaginator(event.data.message, functionKeywordList);

            event.data.message = await this.dispatchPackages(packages, functionKeywordList, '', event);
        }

        this.eventBusOut.notify(event);
    }

    async dispatchPackages(packages: string[], functionKeywords: string[], outgoingMessage: string, originalEvent: IEvent): Promise<string> {
        let hasModified = false;

        await Promise.all(functionKeywords.map(async (functionKeyword) => {
            let firstPackage = _.first(packages);
            if (_.startsWith(firstPackage, `[#${functionKeyword}`)) {
                hasModified = true;
                packages = await this.functionManager.sendToFunction(functionKeyword, packages, originalEvent);
                let newMessage = _.map(packages).join('');
                if (newMessage && newMessage.length) {
                    packages = this.packaginator(newMessage, functionKeywords);
                }
            }
        }));

        if (!hasModified) {
            outgoingMessage = outgoingMessage.concat(packages.shift());
        }

        if (packages && packages.length > 0) {
            return this.dispatchPackages(packages, functionKeywords, outgoingMessage, originalEvent);
        }

        return outgoingMessage;
    }

    packaginator(message: string, keywords: string[]): string[] {
        if (message === undefined || message.length == 0) return [];
        if (keywords === undefined || keywords.length == 0) return [message];

        let begin: number[] = [];
        let end: number[] = [];

        // Collect all begins and ends of functions in the message
        _.each(keywords, (keyword) => {
            begin = _.concat(begin, this.getLocations(`[#${keyword}`, message));
            end = _.concat(end, this.getLocations(`[/#${keyword}]`, message));
        });

        // Sort the begins and ends
        if (begin.length == 0 || end.length == 0) return [message];

        begin.sort((a, b) => a - b);
        end.sort((a, b) => a - b);

        let packages: string[] = [];

        // package plain text before first function
        if (_.first(begin) != 0) {
            packages.push(message.substring(0, _.first(begin)));
        }

        _.each(end, (item) => {
            // Get the first end of function
            let currentMatchingWordSubstring = message.substring(item + 2, message.length - 1);
            let currentMatchingWord = currentMatchingWordSubstring.split("]")[0];

            // Find the matching begin to the end
            let matchingPairIndex = _.findLastIndex(begin, (beg) => {
                return (message.substring(beg + 1, beg + currentMatchingWord.length + 1) == currentMatchingWord) && beg < item;
            });

            let matchingPairElement = begin[matchingPairIndex];
            if (matchingPairIndex == 0) {
                _.remove(begin, function (n) {
                    return n > matchingPairElement && n < (item + currentMatchingWord.length + 3);
                });

                let packageLength = _.reduce(_.map(packages, pack => pack.length), (sum, n) => {
                    return sum + n;
                }, 0);

                if (packageLength != matchingPairElement) {
                    packages.push(message.substring(packageLength, matchingPairElement));
                }

                packages.push(message.substring(matchingPairElement, (item + currentMatchingWord.length + 3)));
            }

            _.remove(begin, function (n) {
                return n == matchingPairElement;
            });
        });

        let currentMatchingWordSubstring = message.substring(_.last(end) + 2, message.length - 1);
        let currentMatchingWord = currentMatchingWordSubstring.split("]")[0];

        if ((_.last(end) + currentMatchingWord.length + 3) != message.length) {
            packages.push(message.substring((_.last(end) + currentMatchingWord.length + 3), message.length));
        }

        return packages;
    }

    getLocations(substring: string, message: string): number[] {
        let locations = [], i = -1;
        while ((i = message.indexOf(substring, i + 1)) >= 0) {
            locations.push(i);
        }
        return locations;
    }
}