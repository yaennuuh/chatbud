import {FunctionManager} from "../../functions/FunctionManager";


export class Emitter {

    emitString = node =>  `${node.value}`;

    emitProgram = async node => (await Promise.all(node.body.map(async exp => await this.emitter(exp)))).join(' ');

    emitExpression = async (node): Promise<string> => {

        const functionManager = FunctionManager.getInstance();

        if (functionManager.getFunctionKeyWords().find((keyWord: string) => keyWord === node.value.substring(1))) {


            return await functionManager.sendToFunction2(node.value.substring(1), node.params);

        } else {
            return Promise.resolve(node.value);
        }
    }

    emitter = async node => {
        switch (node.type) {
            case 'Program':
                return await this.emitProgram(node);
            case 'StringLiteral':
                return this.emitString(node);
            case 'function':
                return await this.emitExpression(node);
            case 'keyword':
                return await this.emitExpression(node);
            default:
                throw new TypeError(node.type);
        }
    }
}
