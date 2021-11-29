import {Token} from "./Tokenizer";

export type ParsedType = 'NumberLiteral' | 'StringLiteral' | 'CallExpression';
export type Parsed = { value: string; type: ParsedType; params?: []};
export interface ParsedObject {position: number; item: Parsed};

export class Parser {

    parseNumber (tokens: Token[], current: number): ParsedObject {
        return {
            position: current + 1,
            item: {
                type: 'NumberLiteral',
                value: tokens[current].value
            }};
    }

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
                type: 'CallExpression',
                value: tokens[current].value,
                params: [],
            }};
    }

    parseExpression (tokens: Token[], current: number) {
        let counter = current;
        let token = tokens[counter];
        let node = {
            type: 'CallExpression',
            value: token.value,
            params: [],
        };

        counter = counter + 1;
        while (counter < tokens.length && !(token.type === 'paren' && token.value ===')')) {
            let parsed = this.parseToken(tokens, counter);
            counter = parsed.position;
            let param = parsed.item;

            node.params.push(param);
            token = tokens[counter];
        }

        return {position: counter < tokens.length ? counter : tokens.length, item: node};
    }

    parseToken (tokens, current) {
        let token: Token = tokens[current];
        if (token.type === 'number') {
            return this.parseNumber(tokens, current);
        }
        if (token.type === 'string' || token.type === 'word') {
            return this.parseString(tokens, current);
        }
        if (token.type === 'keyword') {
            return this.parseKeyWord(tokens, current);
        }
        if (tokens.type === 'function') {
            return this.parseExpression(tokens, current);
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
