
export type TokenType = 'paren' | 'number' | 'word' | 'string';
export interface Token { value: string; type: TokenType};
export type TokenObject = [number, Token] | [number, {}]

export class Tokenizer {

    private skipWhiteSpace (input, current): TokenObject {
        return (/\s/.test(input[current])) ? [1, null] : [0, null];
    }

    private tokenizeCharacter (type: TokenType, value: string, input: string, current: number) : TokenObject {
        return (value === input[current]) ? [1, {type, value}] : [0, null];
    }

    private tokenizePattern (type: TokenType, regExp: RegExp, input: string, current: number): TokenObject {
        let char = input[current];
        let consumedChars = 0;
        if (regExp.test(char)) {
            let value = '';
            while (char && regExp.test(char)) {
                value += char;
                consumedChars ++;
                char = input[current + consumedChars];
            }
            return [consumedChars , {type, value }];
        }
        return [0, null]
    }

    private tokenizeString (input: string, current: number): TokenObject {
        if (input[current] === '"') {
            let value = '';
            let consumedChars = 0;
            consumedChars ++;
            let char = input[current + consumedChars];
            while (char !== '"') {
                if(char === undefined) {
                    throw new TypeError("unterminated string ");
                }
                value += char;
                consumedChars ++;
                char = input[current + consumedChars];
            }
            return [consumedChars + 1, { type: 'string', value }];
        }
        return [0, null]
    }

    tokenizeParenOpen = (input: string, current: number) => this.tokenizeCharacter('paren', '(', input, current);

    tokenizeParenClose = (input: string, current: number) => this.tokenizeCharacter('paren', ')', input, current);

    tokenizeNumber = (input: string, current: number) => this.tokenizePattern("number", /[0-9]/, input, current);

    tokenizeWord = (input: string, current: number) => this.tokenizePattern("word", /[a-z]/i, input, current);

    tokenizeWords = (input: string, current: number) => this.tokenizeString(input, current);

    tokenizeWhiteSpace = (input: string, current: number) => this.skipWhiteSpace(input, current);

    private tokenizers = [
        this.tokenizeWhiteSpace,
        this.tokenizeParenOpen,
        this.tokenizeParenClose,
        this.tokenizeWords,
        this.tokenizeNumber,
        this.tokenizeWord
    ];

    tokenizer = (input: string) => {
        let current = 0;
        let tokens = [];
        while (current < input.length) {
            let tokenized = false;
            this.tokenizers.forEach(tokenizer_fn => {
                if (tokenized) {return;}
                let [consumedChars, token] = tokenizer_fn(input, current);
                if(consumedChars !== 0) {
                    tokenized = true;
                    current = current + consumedChars;
                }
                if(token) {
                    tokens.push(token);
                }
            });
            if (!tokenized) {
                throw new TypeError('I dont know what this character is: ' + input[current]);
            }
        }
        return tokens;
    }
}
