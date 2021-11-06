import { IEvent } from "../events/IEvent";

export interface IFunctionManager {
    unloadFunctions(): void;
    loadFunctions(): void;
    registerFunction(functionKeyword: string, functionInstance: any): void;
    getFunctionKeyWords(): string[];
    sendToFunction(functionKey: string, packages: string[], originalEvent: IEvent): string[];
}