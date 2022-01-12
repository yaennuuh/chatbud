import { expect } from 'chai';
import {Parser} from "../../../src/core/utils/compiler/Parser";
import {Token} from "../../../src/core/utils/compiler/Tokenizer";


describe('Parser', () =>
{
    describe('test parser', () =>
    {
        it('test parseString (string)', () =>
        {
            let parser = new Parser();
            expect(parser.parseString([
                    {"type": "word", "value": "hello"}],
                0
            ))
                .to
                .eql({
                    position: 1,
                    item: {
                        "type": "StringLiteral", "value": "hello"
                    }
                });
        });
        it('test parseKeyWord', () =>
        {
            let parser = new Parser();
            let tokens: Token[] = [
                {"type": "keyword", "value": "$loop"}
            ]
            expect(parser.parseKeyWord(tokens, 0))
                .to
                .eql(
                    {
                        "item": {
                            "type": "keyword",
                            "value": "$loop"
                        },
                        "position": 1
                    }
                );
        });
        it('test function', () =>
        {
            let parser = new Parser();
            let tokens: Token[] = [
                {"type": "keyword", "value": "$loop"},
                {"type": "bracket_open", "value": "("}
            ]
            expect(parser.parseFunction(tokens, 0))
                .to
                .eql(
                    {
                        "item": {
                            "type": "function",
                            "value": "$loop",
                            "params": []
                        },
                        "position": 2
                    }
                );
        });
        it('test parseToken 1', () =>
        {
            let parser = new Parser();
            let tokens: Token[] = [
                {"type": "keyword","value": "$loop"},
                {"type": "bracket_open","value": "("},
                {"type": "quotes","value": "\""},
                {"type": "word","value": "mein"},
                {"type": "space","value": " "},
                {"type": "word","value": "name"},
                {"type": "quotes","value": "\""},
                {"type": "bracket_close","value": ")"}
            ]

            expect(parser.parseToken(tokens, 0))
                .to
                .eql(
                    {
                        "item": {
                            "type": "function",
                            "value": "$loop",
                            "params": [
                                [
                                    {
                                        "type": "StringLiteral",
                                        "value": "mein"
                                    },
                                    {
                                        "type": "StringLiteral",
                                        "value": " "
                                    },
                                    {
                                        "type": "StringLiteral",
                                        "value": "name"
                                    }
                                ]
                            ]
                        },
                        "position": 8,
                    }
                );
        });


        it('test parseToken 2', () =>
        {
            let parser = new Parser();
            let tokens: Token[] = [
                {"type": "keyword","value": "$loop"},
                {"type": "bracket_open","value": "("},
                {"type": "quotes","value": "\""},
                {"type": "word","value": "mein"},
                {"type": "word","value": "name"},
                {"type": "word","value": "ist"},
                {"type": "keyword","value": "$username"},
                {"type": "quotes","value": "\""},
                {"type": "comma","value": ","},
                {"type": "quotes","value": "\""},
                {"type": "word","value": "abc"},
                {"type": "quotes","value": "\""},
                {"type": "bracket_close","value": ")"}
            ]

            expect(parser.parseToken(tokens, 0))
                .to
                .eql(
                    {
                        "item": {
                            "type": "function",
                            "value": "$loop",
                            "params": [
                                [
                                    {
                                        "type": "StringLiteral",
                                        "value": "mein"
                                    },
                                    {
                                        "type": "StringLiteral",
                                        "value": "name"
                                    },
                                    {
                                        "type": "StringLiteral",
                                        "value": "ist"
                                    },
                                    {
                                        "type": "keyword",
                                        "value": "$username"
                                    },
                                ],
                                [
                                    {
                                        "type": "StringLiteral",
                                        "value": "abc",
                                    },
                                ],
                            ],
                        },
                        "position": 13
                    }
                );
        });


        it('test tokenizer with keywords x', () =>
        {
            let parser = new Parser();
            let tokens: Token[] = [
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
            ]

            expect(parser.parseProgram(tokens))
                .to
                .eql(
                    {
                        "type": "Program",
                        "body": [
                            {"type": "StringLiteral", "value": "hallo"},
                            {"type": "function", "value": "$alert", "params": [
                                [
                                    {"type": "keyword", "value": "$username"}
                                ],
                                [
                                    {"type": "StringLiteral", "value": "abc"},
                                    {"type": "keyword", "value": "$points"}
                                ]
                            ]},
                            {"type": "StringLiteral", "value": "du"},
                            {"type": "keyword", "value": "$random"}
                        ]
                    }
                );
        });

        it('test parseToken xx', () =>
        {
            let parser = new Parser();
            let tokens: Token[] = [
                {"type": "word", "value": "hallo"},
                {"type": "keyword", "value": "$alert"},
                {"type": "bracket_open", "value": "("},
                {"type": "quotes", "value": "\""},
                {"type": "keyword", "value": "$username"},
                {"type": "quotes", "value": "\""},
                {"type": "comma", "value": ","},
                {"type": "quotes", "value": "\""},
                {"type": "word", "value": "abc :)"},
                {"type": "keyword", "value": "$points"},
                {"type": "bracket_open", "value": "("},
                {"type": "quotes", "value": "\""},
                {"type": "word", "value": "a"},
                {"type": "quotes", "value": "\""},
                {"type": "bracket_close", "value": ")"},
                {"type": "quotes", "value": "\""},
                {"type": "bracket_close", "value": ")"},
                {"type": "word", "value": "(\"du\") :)"},
                {"type": "keyword", "value": "$random"}
            ]

            expect(parser.parseProgram(tokens))
                .to
                .eql(
                    {
                        "type": "Program",
                        "body": [
                            {"type": "StringLiteral", "value": "hallo"},
                            {"type": "function", "value": "$alert", "params": [
                                    [
                                        {"type": "keyword", "value": "$username"}
                                    ],
                                    [
                                        {"type": "StringLiteral", "value": "abc :)"},
                                        {"type": "function", "value": "$points", "params": [
                                            [
                                                {"type": "StringLiteral", "value": "a"}
                                            ]
                                        ]}
                                    ]
                                ]},
                            {"type": "StringLiteral", "value": "(\"du\") :)"},
                            {"type": "keyword", "value": "$random"}
                        ]
                    }
                );
        });

        it('test parseToken xyz', () =>
        {
            let parser = new Parser();
            let tokens: Token[] = [
                {"type": "keyword", "value": "$dummy"},
                {"type": "bracket_open", "value": "("},
                {"type": "quotes", "value": "\""},
                {"type": "word", "value": "first"},
                {"type": "quotes", "value": "\""},
                {"type": "comma", "value": ","},
                {"type": "space", "value": " "},
                {"type": "quotes", "value": "\""},
                {"type": "keyword", "value": "$dummy"},
                {"type": "bracket_open", "value": "("},
                {"type": "quotes", "value": "\""},
                {"type": "word", "value": "second"},
                {"type": "space", "value": " "},
                {"type": "keyword", "value": "$username"},
                {"type": "quotes", "value": "\""},
                {"type": "comma", "value": ","},
                {"type": "space", "value": " "},
                {"type": "quotes", "value": "\""},
                {"type": "word", "value": "secondError"},
                {"type": "space", "value": " "},
                {"type": "word", "value": "x"},
                {"type": "quotes", "value": "\""},
                {"type": "bracket_close", "value": ")"},
                {"type": "quotes", "value": "\""},
                {"type": "comma", "value": ","},
                {"type": "space", "value": " "},
                {"type": "quotes", "value": "\""},
                {"type": "word", "value": "firstError"},
                {"type": "quotes", "value": "\""},
                {"type": "bracket_close", "value": ")"}
            ]

            expect(parser.parseProgram(tokens))
                .to
                .eql(
                    {
                        "body": [
                            {"type": "function",
                                "value": "$dummy",
                                "params": [
                                    [
                                        {"type": "StringLiteral", "value": "first"},
                                    ],
                                    [
                                        {"type": "function",
                                            "value": "$dummy",
                                            "params": [
                                                [
                                                    {"type": "StringLiteral", "value": "second"},
                                                    {"type": "StringLiteral", "value": " "},
                                                    {"type": "keyword", "value": "$username"}
                                                ],
                                                [
                                                    {"type": "StringLiteral", "value": "secondError"},
                                                    {"type": "StringLiteral", "value": " "},
                                                    {"type": "StringLiteral", "value": "x"}
                                                ]
                                            ]
                                        }
                                    ],
                                    [
                                        {"type": "StringLiteral", "value": "firstError"},
                                    ]
                                ]
                            }
                        ],
                        "type": "Program"
                    }
                );
        });
    });
});
