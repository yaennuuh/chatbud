import {Token} from "./Tokenizer";

export type ParsedType = 'StringLiteral' | 'CallExpression' | 'function' | 'keyword';
export type Parsed = { value: string; type: ParsedType; params?: []};
export interface ParsedObject {position: number; item: Parsed};

export class Parser {

    parseString (tokens: Token[], current: number): ParsedObject {
        return {
            position: current + 1,
            item: {type: 'StringLiteral',
                value: tokens[current].value,
            }};
    }

    parseKeyWord (tokens: Token[], current: number): ParsedObject {
        return {
            position: current + 1,
            item: {
                type: 'keyword',
                value: tokens[current].value
            }};
    }

    parseFunction (tokens: Token[], current: number) {
        let counter = current;
        let token = tokens[counter];
        let node = {
            type: 'function',
            value: token.value,
            params: [],
        };

        counter = counter + 2;
        while (counter < tokens.length && token.type !== 'bracket_close') {
            let parsed = this.parseToken(tokens, counter);
            counter = parsed.position;
            let param = parsed.item;

            node.params.push(param);
            token = tokens[counter];
        }

        return {position: counter < tokens.length ? counter : tokens.length, item: node};
    }

    parseParameter (tokens: Token[], current: number) {
        let counter = current + 1;
        let token = tokens[counter];
        let node = [];

        while (counter < tokens.length && token.type !== 'quotes') {
            let parsed = this.parseToken(tokens, counter);
            counter = parsed.position;
            let param = parsed.item;

            node.push(param);
            token = tokens[counter];
        }

        counter = counter + 1;
        return {position: counter < tokens.length ? counter : tokens.length, item: node};
    }

    parseToken (tokens, current) {
        let token: Token = tokens[current];
        let lastToken: Token = tokens[current - 1];
        let nextToken: Token = tokens[current + 1];

        if (token.type === 'word') {
            return this.parseString(tokens, current);
        }
        if ((token.type === 'keyword' && nextToken.type === 'bracket_open') || token.type === 'bracket_close') {
            return this.parseFunction(tokens, current);
        }
        if (token.type === 'keyword') {
            return this.parseKeyWord(tokens, current);
        }
        if (token.type === 'quotes'){
            return this.parseParameter(tokens, current);
        }

        throw new TypeError(token.type);
    }

    parseProgram(tokens) {
        let current = 0;
        let ast = {
            type: 'Program',
            body: [],
        };
        let node = null;
        while (current < tokens.length) {
            let parsed = this.parseToken(tokens, current);
            current = parsed.position;
            node = parsed.item;
            ast.body.push(node);
        }
        return ast;
    }
}