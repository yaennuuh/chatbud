import {Token} from "./Tokenizer";

export type ParsedType = 'NumberLiteral' | 'StringLiteral' | 'CallExpression';
export type Parsed = { value: string; type: ParsedType };
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

    parseExpression (tokens: Token[], current: number) {
        let counter = current;
        counter = counter + 1;
        let token = tokens[counter];
        let node = {
            type: 'CallExpression',
            value: token.value,
            params: [],
        };

        counter = counter + 1;
        while (!(token.type === 'paren' && token.value ===')')) {
            let parsed = this.parseToken(tokens, counter);
            counter = parsed.position;
            let param = parsed.item;

            node.params.push(param);
            token = tokens[counter];
        }

        counter++;
        return {position: counter, item: node};
    }

    parseToken (tokens, current) {
        let token: Token = tokens[current];
        if (token.type === 'number') {
            return this.parseNumber(tokens, current);
        }
        if (token.type === 'string') {
            return this.parseString(tokens, current);
        }
        if (token.type === 'paren' && token.value === '(') {
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
