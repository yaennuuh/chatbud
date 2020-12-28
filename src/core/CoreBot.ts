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

    registerPluginToEventBusIn(plugin: IPlugin, eventTypeList: string[]): void {
        this.eventBusIn.subscribe(plugin, eventTypeList);
    }

    notifyPluginsOnEventBusIn(event: IEvent): void {
        this.eventBusIn.notify(event);
    }

    /***
     * EVENT BUS OUT
     */

    registerNotifiableToEventBusOut(notifiable: INotifiable, eventTypeList: string[]): void {
        this.eventBusOut.subscribe(notifiable, eventTypeList);
    }

    notifyNotifiableOnEventBusOut(event: IEvent): void {
        let filterKeywordList = this.filterManager.getFilterKeyWords();

        if (filterKeywordList && filterKeywordList.length) {
            _.each(filterKeywordList, (filterKeyword) => {
                if (event.data.message.indexOf(filterKeyword) != -1) {
                    event.data.message = this.filterManager.applyFilter(filterKeyword, event);
                }
            });
        }

        let functionKeywordList = this.functionManager.getFunctionKeyWords();

        if (functionKeywordList && functionKeywordList.length) {
            let packages: string[] = this.packaginator(event.data.message, functionKeywordList);

            event.data.message = this.dispatchPackages(packages, functionKeywordList, '');
        }

        console.log(event.data.message);

        //this.eventBusOut.notify(event);
    }

    dispatchPackages(packages: string[], functionKeywords: string[], outgoingMessage: string): string {
        let hasModified = false;
        let message = outgoingMessage;

        _.each(functionKeywords, (functionKeyword) => {
            let firstPackage = _.first(packages);
            if (this.packStartsWith(firstPackage, functionKeyword)) {
                hasModified = true;
                packages = this.functionManager.sendToFunction(functionKeyword, packages);
                let newMessage = _.map(packages).join('');
                if (newMessage && newMessage.length) {
                    packages = this.packaginator(newMessage, functionKeywords);
                }
            }
        });

        if (!hasModified) {
            message = message.concat(_.first(packages));
            if (packages.length > 1) {
                packages = _.slice(packages, 1);
            } else {
                packages = [];
            }
        }

        if (packages && packages.length > 0) return this.dispatchPackages(packages, functionKeywords, message);

        return message;
    }

    packStartsWith(pack: string, keyword: string): boolean {
        return _.startsWith(pack, `[#${keyword}`);
    }

    packaginator(message: string, keywords: string[]): string[] {

        if (message === undefined || message.length == 0) return [];
        if (keywords === undefined || keywords.length == 0) return [message];

        let begin: number[] = [];
        let end: number[] = [];

        _.each(keywords, (keyword) => {
            begin = _.concat(begin, this.locations(`[#${keyword}`, message));
            end = _.concat(end, this.locations(`[/#${keyword}]`, message));
        });

        if (begin.length == 0 || end.length == 0) return [message];

        begin.sort((a, b) => a - b);
        end.sort((a, b) => a - b);

        let packages: string[] = [];

        if (_.first(begin) != 0) {
            packages.push(message.substring(0, _.first(begin)));
        }

        _.each(end, (item) => {
            let currentMathingWordSubstring = message.substring(item + 2, message.length - 1);
            let currentMathingWord = currentMathingWordSubstring.split("]")[0];

            let matchingPairIndex = _.findLastIndex(begin, (beg) => {
                return (message.substring(beg + 1, beg + currentMathingWord.length + 1) == currentMathingWord) && beg < item;
            });
            let matchingPairElement = begin[matchingPairIndex];
            if (matchingPairIndex == 0) {
                _.remove(begin, function (n) {
                    return n > matchingPairElement && n < (item + currentMathingWord.length + 3);
                });

                let packageLength = _.reduce(_.map(packages, pack => pack.length), (sum, n) => {
                    return sum + n;
                }, 0);

                if (packageLength != matchingPairElement) {
                    packages.push(message.substring(packageLength, matchingPairElement));
                }

                packages.push(message.substring(matchingPairElement, (item + currentMathingWord.length + 3)));
            }

            _.remove(begin, function (n) {
                return n == matchingPairElement;
            });
        });

        let currentMathingWordSubstring = message.substring(_.last(end) + 2, message.length - 1);
        let currentMathingWord = currentMathingWordSubstring.split("]")[0];

        if ((_.last(end) + currentMathingWord.length + 3) != message.length) {
            packages.push(message.substring((_.last(end) + currentMathingWord.length + 3), message.length));
        }

        return packages;
    }

    locations(substring: string, message: string): number[] {
        let a = [], i = -1;
        while ((i = message.indexOf(substring, i + 1)) >= 0) a.push(i);
        return a;
    }
}