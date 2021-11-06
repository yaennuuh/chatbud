import { IFunctionManager } from "./IFunctionManager";
import { glob } from 'glob';
import * as _ from 'lodash';
import { CoreHelper } from "../CoreHelper";
import { IEvent } from "../events/IEvent";

export class FunctionManager implements IFunctionManager {
    private static instance: FunctionManager;

    functionMap: Map<string, any>;

    resourcesPath: string;

    private constructor() {
        this.functionMap = new Map();
    }

    static getInstance(): FunctionManager {
        if (this.instance == null) {
            this.instance = new FunctionManager();
        }
        
        FunctionManager.instance.resourcesPath = CoreHelper.getInstance().getResourcesPath('functions');

        return this.instance;
    }

    unloadFunctions(): void {
        this.functionMap = new Map();
    }

    loadFunctions(): void {
        const files: string[] = glob.sync(`${this.resourcesPath}/**/function.js`, null);
        _.each(files, (file) => {
            const CustomFunction = require(file);
            const customFunctionInstance = new CustomFunction();
            this.registerFunction(customFunctionInstance.register(), customFunctionInstance);
        });
    };

    registerFunction(functionKeyword: string, functionInstance: any): void {
        this.functionMap.set(functionKeyword, functionInstance);
    }

    getFunctionKeyWords(): string[] {
        return Array.from(this.functionMap.keys());
    }

    sendToFunction(functionKey: string, packages: string[], originalEvent: IEvent): string[] {
        const functionInstance: any = this.functionMap.get(functionKey);
        const firstPack = packages.shift();
        const stringToWork = firstPack.substring(functionKey.length+3, firstPack.length - (functionKey.length+3));
        const params = _.split(stringToWork.substring(0, stringToWork.indexOf(']')), ',');
        const content = stringToWork.substring(stringToWork.indexOf(']') + 1, stringToWork.length);
        return functionInstance.execute(params, content, packages, originalEvent);
    }
}