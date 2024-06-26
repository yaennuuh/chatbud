import {Token, TokenType} from "./Tokenizer";
import {isArray} from "util";

export type ParsedType = 'Program' | 'StringLiteral' | 'function' | 'keyword';
export type Parsed = { value: string; type: ParsedType; params?: Parsed[][]};
export type ParsedProgramm = {type: ParsedType; body: Parsed[]};
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

            if(isArray(param)){
                node.params.push(param);
            }

            token = tokens[counter];
        }

        if(counter < tokens.length && tokens[counter].type === 'bracket_close'){
            counter = counter + 1;
        }

        return {position: counter < tokens.length ? counter : tokens.length, item: node};
    }

    parseParameter (tokens: Token[], current: number) {
        let counter = current + 1;
        let token = tokens[counter];
        let node = [];

        while (counter < tokens.length && tokens[counter].type !== 'quotes') {
            let parsed = this.parseToken(tokens, counter);
            counter = parsed.position;
            let param = parsed.item;

            node.push(param);
            token = tokens[counter];
        }

        counter = counter + 1;

        if(counter < tokens.length && tokens[counter].type === 'comma'){
            counter = counter + 1;
        }

        return {position: counter < tokens.length ? counter : tokens.length, item: node};
    }

    parseToken (tokens, current) {
        let token: Token = tokens[current];
        let lastToken: Token = tokens[current - 1];
        let nextTokenType: TokenType = 'end';

        if(current + 1 < tokens.length){
            nextTokenType = tokens[current + 1].type
        }

        if (token.type === 'word' || token.type === 'comma' || token.type === 'space') {
            return this.parseString(tokens, current);
        }
        if (token.type === 'keyword' && nextTokenType === 'bracket_open') {
            return this.parseFunction(tokens, current);
        }
        if (token.type === 'keyword') {
            return this.parseKeyWord(tokens, current);
        }
        if (token.type === 'quotes'){
            return this.parseParameter(tokens, current);
        }

        throw new TypeError(token.type);
        // return {
        //     position: current + 1,
        //     item: {type: 'StringLiteral',
        //         value: 'fuck you',
        //     }};
    }

    parseProgram(tokens): ParsedProgramm {
        let current = 0;
        let ast: ParsedProgramm = {
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
