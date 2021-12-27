import { FunctionManager } from "../../functions/FunctionManager";
import {Parsed, ParsedProgramm} from "./Parser";

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

    private async resolveProgram (parsedItem: ParsedProgramm): Promise<string>{
        let mappedShit = await Promise.all(parsedItem.body.map(async (exp) => {
            return await this.resolveItem(exp);
        }));

        let joinedShit = mappedShit.join(' ');

        return Promise.resolve(joinedShit);
    }

    private async resolveExpression (parsedItem: Parsed): Promise<string>{
        const functionManager = FunctionManager.getInstance();

        if (functionManager.getFunctionKeyWords().find((keyWord: string) => keyWord === parsedItem.value.substring(1))) {


            let strings = parsedItem.params ? this.joinParamsToString(parsedItem.params) : [];

            return await functionManager.sendToFunction2(parsedItem.value.substring(1), strings);

        } else {
            return Promise.resolve(parsedItem.value);
        }
    }

    private joinParamsToString(params: Parsed[][]): string[]{
        let res: string[] = [];

        if (params){
            for (const param of params) {
                res.push(this.paramToString(param));
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

        return tmp.join(' ');
    }

    public resolve(parsedItem: ParsedProgramm): Promise<string>{
        switch (parsedItem.type) {
            case 'Program':
                return this.resolveProgram(parsedItem);
            default:
                throw new TypeError(parsedItem.type);
        }
    }

    public resolveItem(parsedItem: Parsed): Promise<string>{
        switch (parsedItem.type) {
            case 'StringLiteral':
                return this.resolveString(parsedItem);
            case 'function':
                return this.resolveExpression(parsedItem);
            case 'keyword':
                return this.resolveExpression(parsedItem);
            default:
                throw new TypeError(parsedItem.type);
        }
    }
}
