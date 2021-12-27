import { IFunctionManager } from "./IFunctionManager";
import { glob } from 'glob';
import * as _ from 'lodash';
import { CoreHelper } from "../CoreHelper";
import { IEvent } from "../events/IEvent";
import * as LivePluginManager from "live-plugin-manager";
import * as fs from 'fs';
import * as YAML from 'yaml';
import {Parsed} from "../utils/compiler/Parser";

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

        const resourcesPath = CoreHelper.getInstance()?.getResourcesPath('functions');
        FunctionManager.instance.resourcesPath = resourcesPath ? resourcesPath : '';

        return this.instance;
    }

    unloadFunctions(): void {
        this.functionMap = new Map();
    }

    async loadFunctions(): Promise<void> {
        const files: string[] = glob.sync(`${this.resourcesPath}/**/function.js`, null);
        for(const file of files) {
            await this.installDependency(file);
            const CustomFunction = require(file);
            const customFunctionInstance = new CustomFunction();
            this.registerFunction(customFunctionInstance.register(), customFunctionInstance);
        };
    };

    registerFunction(functionKeyword: string, functionInstance: any): void {
        this.functionMap.set(functionKeyword, functionInstance);
    }

    getFunctionKeyWords(): string[] {
        return Array.from(this.functionMap.keys());
    }

    // async sendToFunction(functionKey: string, packages: string[], originalEvent: IEvent): Promise<string[]> {
    //     const functionInstance: any = this.functionMap.get(functionKey);
    //     const firstPack = packages.shift();
    //     const stringToWork = firstPack.substring(functionKey.length+3, firstPack.length - (functionKey.length+4));
    //     const params = _.split(stringToWork.trim().substring(0, stringToWork.lastIndexOf(']')), ',');
    //     const content = stringToWork.substring(stringToWork.lastIndexOf(']') + 1, stringToWork.length);
    //     return await functionInstance.execute(params, content, packages, originalEvent);
    // }

    async sendToFunction(functionKey: string, parsedItems: string[], originalEvent: IEvent): Promise<string> {
        const functionInstance: any = this.functionMap.get(functionKey);

        return await functionInstance.execute(parsedItems, originalEvent);
    }

    private async installDependency(functionPath: string) {
        const path = functionPath.slice(0, -11);
        const configPath = path + 'config.yaml';
        if (fs.existsSync(configPath)) {
            const file = fs.readFileSync(configPath, 'utf8');
            const config = YAML.parse(file);
            if (fs.existsSync(path)) {
                const npmPluginManager = new LivePluginManager.PluginManager({pluginsPath: path+'/node_modules'});
                for (const dependency of config.dependencies) {
                    await npmPluginManager.installFromNpm(dependency.split('@')[0], dependency.split('@')[1]);
                };
            }
        }
    }
}
