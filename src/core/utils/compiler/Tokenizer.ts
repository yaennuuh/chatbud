
export type TokenType = 'bracket_open' | 'bracket_close' | 'word' | 'text' | 'keyword' | 'comma' | 'space' | 'quotes' | 'end';
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

    private tokenizeKeyWordPattern (type: TokenType, identifier: string, regExp: RegExp, input: string, current: number): TokenObject {
        if (input[current] === identifier && /[a-zA-Z0-9]/i.test(input[current+1])) {
            let consumedChars = 1;
            let value = '';
            let sub = input.substring(current, current + identifier.length + consumedChars) // 1 consumed char + 1 to get the next one
            while (sub && regExp.test(sub)) {
                value += sub;
                sub = input[current + identifier.length + consumedChars];
                consumedChars = consumedChars + 1;
            }
            return [consumedChars , {type, value}];
        }
        return [0, null]
    }

    tokenizeBracketOpen = (input: string, current: number) => this.tokenizeCharacter('bracket_open', '(', input, current);

    tokenizeBracketClose = (input: string, current: number) => this.tokenizeCharacter('bracket_close', ')', input, current);

    tokenizeComma = (input: string, current: number) => this.tokenizeCharacter('comma', ',', input, current);

    tokenizeSpace = (input: string, current: number) => this.tokenizeCharacter('space', ' ', input, current);

    tokenizeQuotes = (input: string, current: number) => this.tokenizeCharacter('quotes', '"', input, current);

    tokenizeKeyWord = (input: string, current: number) => this.tokenizeKeyWordPattern("keyword", '$', /[a-z]/i, input, current);

    tokenizeWord = (input: string, current: number) => this.tokenizePattern("word", /[^\s"]/i, input, current);

    // tokenizeWhiteSpace = (input: string, current: number) => this.skipWhiteSpace(input, current);

    private tokenizers = [
        this.tokenizeSpace,
        this.tokenizeBracketOpen,
        this.tokenizeBracketClose,
        this.tokenizeComma,
        this.tokenizeQuotes,
        this.tokenizeKeyWord,
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

    checktokens = (tokens: Token[]): Token[] => {
        let tmp = tokens;

        tmp.forEach((value, index, array) => {
            if(value.type === 'text'){
                let subTokens = this.tokenizer(value.value);
                if(subTokens.length > 1){
                    array.splice(index, 1, ...subTokens)
                }
            }
        })

        return tokens.length == tmp.length ? tokens : this.checktokens(tokens);
    }
}
