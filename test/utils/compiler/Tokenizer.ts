import {Tokenizer} from "../../../src/core/utils/compiler/Tokenizer";
import {expect} from "chai";


describe('Tokenizer', () =>
{
    describe('test tokenizer', () =>
    {
        it('test tokenizeParenOpen', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeParenOpen('(', 0))
                .to
                .eql([1,
                    {
                        "type": "paren",
                        "value": "(",
                    },
                ]);
        });
        it('test tokenizeParenClose', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeParenClose(')', 0))
                .to
                .eql([1,
                    {
                        "type": "paren",
                        "value": ")",
                    },
                ]);
        });
        it('test tokenizeNumber', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeNumber("123aad", 0))
                .to
                .eql([3,
                    {
                        "type": "number",
                        "value": "123",
                    },
                ]);
        });
        it('test tokenizeKeyWord', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeKeyWord('hello $world', 6))
                .to
                .eql([12,
                    {
                        "type": "keyword",
                        "value": "$world",
                    },
                ]);
        });
        it('test tokenizeFunction', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeFunction('hello $world()', 6))
                .to
                .eql([13,
                    {
                        "type": "function",
                        "value": "world",
                    },
                ]);
        });
        it('test tokenizeWord', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeWord('hello world', 0))
                .to
                .eql([5,
                    {
                        "type": "word",
                        "value": "hello",
                    },
                ]);
        });
        it('test tokenizeWords', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeWords('"hello world"', 0))
                .to
                .eql([13,
                    {
                        "type": "string",
                        "value": "hello world",
                    },
                ]);
        });
        it('test tokenizeWhiteSpace', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeWhiteSpace(' ', 0))
                .to
                .eql([1,
                    null,
                ]);
        });
        it('test tokenizer with keywords', () =>
        {
            let tokenizer = new Tokenizer();
            let tokens = tokenizer.tokenizer('$loop("mein name ist $username", "3")');
            expect(tokenizer.checktokens(tokens))
                .to
                .eql([
                    {
                        "type": "function",
                        "value": "loop"
                    },
                    {
                        "type": "word",
                        "value": "mein"
                    },
                    {
                        "type": "word",
                        "value": "name"
                    },
                    {
                        "type": "word",
                        "value": "ist"
                    },
                    {
                        "type": "keyword",
                        "value": "$username"
                    },
                    {
                        "type": "string",
                        "value": "3"
                    },
                    {
                        "type": "paren",
                        "value": ")"
                    }
                ]);
        });
    });
});
