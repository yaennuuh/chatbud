import {Tokenizer} from "../../../src/core/utils/compiler/Tokenizer";
import {expect} from "chai";


describe('Tokenizer', () =>
{
    describe('test tokenizer', () =>
    {
        it('test tokenizeBracketOpen', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeBracketOpen('(', 0))
                .to
                .eql([1,
                    {
                        "type": "bracket_open",
                        "value": "(",
                    },
                ]);
        });
        it('test tokenizeBracketClose', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeBracketClose(')', 0))
                .to
                .eql([1,
                    {
                        "type": "bracket_close",
                        "value": ")",
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
        it('test tokenizeComma', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeComma(',', 0))
                .to
                .eql([1,
                    {
                        "type": "comma",
                        "value": ",",
                    },
                ]);
        });
        it('test tokenizeQuotes', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeQuotes('"', 0))
                .to
                .eql([1,
                    {
                        "type": "quotes",
                        "value": "\"",
                    },
                ]);
        });
        it('test tokenizeKeyWord', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizeKeyWord('hello $world', 6))
                .to
                .eql([6,
                    {
                        "type": "keyword",
                        "value": "$world",
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
        it('test tokenizer with keywords', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizer('$loop("mein name ist $username", "abc")'))
                .to
                .eql([
                    {
                        "type": "keyword",
                        "value": "$loop"
                    },
                    {
                        "type": "bracket_open",
                        "value": "("
                    },
                    {
                        "type": "quotes",
                        "value": "\""
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
                        "type": "quotes",
                        "value": "\""
                    },
                    {
                        "type": "comma",
                        "value": ","
                    },
                    {
                        "type": "quotes",
                        "value": "\""
                    },
                    {
                        "type": "word",
                        "value": "abc"
                    },
                    {
                        "type": "quotes",
                        "value": "\""
                    },
                    {
                        "type": "bracket_close",
                        "value": ")"
                    }
                ]);
        });



        it('test tokenizer with keywords x', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizer('hallo $alert("$username", "abc $points") du $random'))
                .to
                .eql([
                    {"type": "word", "value": "hallo"},
                    {"type": "keyword", "value": "$alert"},
                    {"type": "bracket_open", "value": "("},
                    {"type": "quotes", "value": "\""},
                    {"type": "keyword", "value": "$username"},
                    {"type": "quotes", "value": "\""},
                    {"type": "comma", "value": ","},
                    {"type": "quotes", "value": "\""},
                    {"type": "word", "value": "abc"},
                    {"type": "keyword", "value": "$points"},
                    {"type": "quotes", "value": "\""},
                    {"type": "bracket_close", "value": ")"},
                    {"type": "word", "value": "du"},
                    {"type": "keyword", "value": "$random"}
                ]);
        });
        it('test tokenizer with keywords xx', () =>
        {
            let tokenizer = new Tokenizer();
            expect(tokenizer.tokenizer('hallo $alert("$username", "abc $points("a")") du $random'))
                .to
                .eql([
                    {"type": "word", "value": "hallo"},
                    {"type": "keyword", "value": "$alert"},
                    {"type": "bracket_open", "value": "("},
                    {"type": "quotes", "value": "\""},
                    {"type": "keyword", "value": "$username"},
                    {"type": "quotes", "value": "\""},
                    {"type": "comma", "value": ","},
                    {"type": "quotes", "value": "\""},
                    {"type": "word", "value": "abc"},
                    {"type": "keyword", "value": "$points"},
                    {"type": "bracket_open", "value": "("},
                    {"type": "quotes", "value": "\""},
                    {"type": "word", "value": "a"},
                    {"type": "quotes", "value": "\""},
                    {"type": "bracket_close", "value": ")"},
                    {"type": "quotes", "value": "\""},
                    {"type": "bracket_close", "value": ")"},
                    {"type": "word", "value": "du"},
                    {"type": "keyword", "value": "$random"}
                ]);
        });
    });
});
