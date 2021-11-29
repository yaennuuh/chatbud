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
        it('test tokenizer', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizer('(add 2 (subtract "314" 2))'))
                .to
                .eql([
                    {"type": "paren", "value": "("},
                    {"type": "word", "value": "add"},
                    {"type": "number", "value": "2"},
                    {"type": "paren", "value": "("},
                    {"type": "word", "value": "subtract"},
                    {"type": "string", "value": "314"},
                    {"type": "number", "value": "2"},
                    {"type": "paren", "value": ")"},
                    {"type": "paren", "value": ")"}
                ]);
        });
    });
});
