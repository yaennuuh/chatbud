import { FunctionManager } from "../../functions/FunctionManager";
import {Parsed, ParsedProgramm} from "./Parser";
import {IEvent} from "../../events/IEvent";

export class Resolver {
    private static instance: Resolver;

    private constructor() {}

    static getInstance(): Resolver {
        if (this.instance == null) {
            this.instance = new Resolver();
        }

        return this.instance;
    }

    private resolveString(parsedItem: Parsed): Promise<string>{
        return Promise.resolve(`${parsedItem.value}`);
    }

    private async resolveProgram (parsedItem: ParsedProgramm, originalEvent: IEvent): Promise<string>{
        let mappedShit = await Promise.all(parsedItem.body.map(async (exp, index) => {
            const val = await this.resolveItem(exp, originalEvent);
            // const addSpace = exp.type == "StringLiteral" && index < parsedItem.body.length - 1;
            // return addSpace ? val + ' ' : val;
            return val;
        }));

        // let joinedShit = mappedShit.join('');

        return Promise.resolve(mappedShit.join(''));
    }

    private async resolveExpression (parsedItem: Parsed, originalEvent: IEvent): Promise<string>{
        const functionManager = FunctionManager.getInstance();

        if (functionManager.getFunctionKeyWords().find((keyWord: string) => keyWord === parsedItem.value.substring(1))) {


            let strings = parsedItem.params ? this.joinParamsToString(parsedItem.params) : [];

            return await functionManager.sendToFunction(parsedItem.value.substring(1), strings, originalEvent);

        } else {
            return Promise.resolve(parsedItem.value);
        }
    }

    private joinParamsToString(params: Parsed[][]): string[]{
        let res: string[] = [];

        if (params){
            for (const param of params) {
                if(Array.isArray(param)){
                    res.push(this.paramToString(param));
                }
            }
        }

        return res;
    }

    private paramToString(param: Parsed[]): string{

        let tmp: string[] = [];

        param.forEach(value => {
            tmp.push(value.value);

            if(value.type == "function") {
                tmp.push("(");

                value.params.forEach(value1 => {
                    tmp.push('"');
                    tmp.push(this.paramToString(value1));
                    tmp.push('"');
                })
                tmp.push(")");
            }
        })

        return tmp.join('');
    }

    public resolve(parsedItem: ParsedProgramm, originalEvent: IEvent): Promise<string>{
        switch (parsedItem.type) {
            case 'Program':
                return this.resolveProgram(parsedItem, originalEvent);
            default:
                throw new TypeError(parsedItem.type);
        }
    }

    public resolveItem(parsedItem: Parsed, originalEvent: IEvent): Promise<string>{
        switch (parsedItem.type) {
            case 'StringLiteral':
                return this.resolveString(parsedItem);
            case 'function':
                return this.resolveExpression(parsedItem, originalEvent);
            case 'keyword':
                return this.resolveExpression(parsedItem, originalEvent);
            default:
                throw new TypeError(parsedItem.type);
        }
    }
}
