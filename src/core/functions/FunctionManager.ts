import { IFunctionManager } from "./IFunctionManager";
import { glob } from 'glob';
import * as _ from 'lodash';

export class FunctionManager implements IFunctionManager {
    private static instance: FunctionManager;

    functionMap: Map<string, any>;

    private constructor() {
        this.functionMap = new Map();
    }

    static getInstance(): FunctionManager {
        if (this.instance == null) {
            this.instance = new FunctionManager();
        }
        return this.instance;
    }

    loadFunctions(): void {
        const files: string[] = glob.sync(__dirname + "/../../functions/**/function.js", null);
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

    sendToFunction(functionKey: string, packages: string[]): string[] {
        let functionInstance: any = this.functionMap.get(functionKey);
        return functionInstance.execute(packages);
    }
}