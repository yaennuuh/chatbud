import { expect } from 'chai';
import {Compiler} from "../../../src/core/utils/compiler/Compiler";
import {Parser} from "../../../src/core/utils/compiler/Parser";
import {Token} from "../../../src/core/utils/compiler/Tokenizer";


describe('Parser', () =>
{
    describe('test parser', () =>
    {
        it('test parseNumber', () =>
        {
            let parser = new Parser();
            expect(parser.parseNumber([
                {"type": "number", "value": "42"}],
                0
            ))
                .to
                .eql({
                    position: 1,
                    item: {
                        "type": "NumberLiteral", "value": "42"
                    }
                });
        });
        it('test parseString', () =>
        {
            let parser = new Parser();
            expect(parser.parseString([
                    {"type": "string", "value": "Hello World!"}],
                0
            ))
                .to
                .eql({
                    position: 1,
                    item: {
                        "type": "StringLiteral", "value": "Hello World!"
                    }
                });
        });

        it('test parseExpression', () =>
        {
            let parser = new Parser();

            let tokens: Token[] = [
                {type: "paren", value: "("},
                {type: "word", value: "add"},
                {type: "number", value: "2"},
                {type: "paren", value: "("},
                {type: "word", value: "subtract"},
                {type: "number", value: "4"},
                {type: "number", value: "2"},
                {type: "paren", value: ")"},
                {type: "paren", value: ")"}
            ]

            expect(parser.parseExpression(tokens, 3))
                .to
                .eql(
                    {
                        "position": 8,
                        "item": {
                            "value": "subtract",
                            "params": [
                                {
                                "type": "NumberLiteral",
                                "value": "4",
                                },
                                {
                                "type": "NumberLiteral",
                                "value": "2",
                                },
                            ],
                            "type": "CallExpression",
                        }
                    }
                );
        });
        it('test parseProgram', () =>
        {
            let parser = new Parser();

            let tokens =  [
                { type: 'paren',  value: '('        },
                { type: 'word',   value: 'print'      },
                { type: 'string', value: 'Hello'      },
                { type: 'number', value: '2'        },
                { type: 'paren',  value: ')'        },
                { type: 'paren',  value: '('        },
                { type: 'word',   value: 'add'      },
                { type: 'number', value: '2'        },
                { type: 'paren',  value: '('        },
                { type: 'word',   value: 'subtract' },
                { type: 'number', value: '4'        },
                { type: 'number', value: '2'        },
                { type: 'paren',  value: ')'        },
                { type: 'paren',  value: ')'        },
            ];

            expect(parser.parseProgram(
                tokens
            ))
                .to
                .eql({
                        "body": [
                            {
                                "value": "print",
                                "params": [
                                    {
                                        "type": "StringLiteral",
                                        "value": "Hello"
                                    },
                                    {
                                        "type": "NumberLiteral",
                                        "value": "2"
                                    }
                                ],
                                "type": "CallExpression"
                            },
                            {
                                "value": "add",
                                "params": [
                                    {
                                        "type": "NumberLiteral",
                                        "value": "2"
                                    },
                                    {
                                        "value": "subtract",
                                        "params": [
                                            {
                                                "type": "NumberLiteral",
                                                "value": "4"
                                            },
                                            {
                                                "type": "NumberLiteral",
                                                "value": "2"
                                            }
                                        ],
                                        "type": "CallExpression",
                                    }
                                ],
                                "type": "CallExpression"
                            }
                        ],
                        "type": "Program"
                    }
                );
        });
    });
});
