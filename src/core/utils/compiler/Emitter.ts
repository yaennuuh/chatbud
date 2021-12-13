import { FunctionManager } from "../../functions/FunctionManager";


export class Emitter {

    emitString = (node): Promise<string> => {
        return Promise.resolve(`${node.value}`);
    };

    emitProgram = async (node): Promise<string> => {

        let mappedShit = await Promise.all(node.body.map(async (exp) => {
            return await this.emitter(exp);
        }));

        let joinedShit = mappedShit.join(' ');

        return Promise.resolve(joinedShit);
    };

    emitExpression = async (node): Promise<string> => {

        const functionManager = FunctionManager.getInstance();

        if (functionManager.getFunctionKeyWords().find((keyWord: string) => keyWord === node.value.substring(1))) {
            return await functionManager.sendToFunction2(node.value.substring(1), node.params);

        } else {
            return Promise.resolve(node.value);
        }
    }

    emitter = (node): Promise<string> => {
        switch (node.type) {
            case 'Program':
                return this.emitProgram(node);
            case 'StringLiteral':
                return this.emitString(node);
            case 'function':
                return this.emitExpression(node);
            case 'keyword':
                return this.emitExpression(node);
            default:
                throw new TypeError(node.type);
        }
    }
}
