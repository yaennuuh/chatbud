import { IFunctionManager } from "./IFunctionManager";
import * as _ from 'lodash';

export class FunctionManager implements IFunctionManager {

    functionMap: Map<string, any>;

    constructor() {
        this.functionMap = new Map();
        this.functionMap.set('loop', new LoopFunction());
        this.functionMap.set('yannick', null);
    }

    registerFunction(functionKeyword: string, functionInstance: any) {
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

export class LoopFunction {
    execute(packages: string[]): string[] {
        let pack: string = packages.shift();
        let stringToWork = pack.substring(7, pack.length - 8);
        let params = Number.parseInt(stringToWork.substring(0, stringToWork.indexOf(']')));
        let content = stringToWork.substring(stringToWork.indexOf(']') + 1, stringToWork.length);

        return _.concat(_.times(params, _.constant(content)), packages);
    }
}