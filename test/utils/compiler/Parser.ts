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
        it('test parseString (string)', () =>
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
        it('test parseString (word)', () =>
        {
            let parser = new Parser();
            expect(parser.parseString([
                    {"type": "word", "value": "Hello!"}],
                0
            ))
                .to
                .eql({
                    position: 1,
                    item: {
                        "type": "StringLiteral", "value": "Hello!"
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
                            "type": "CallExpression",
                            "value": "$loop",
                            "params": []
                        },
                        "position": 1
                    }
                );
        });

        it('test parseExpression 3', () =>
        {
            let parser = new Parser();
            let tokens: Token[] = [
                {"type": "function", "value": "loop"},
                {"type": "word", "value": "mein"},
                {"type": "word", "value": "name"},
                {"type": "word", "value": "ist"},
                {"type": "keyword", "value": "$username"},
                {"type": "string", "value": "3"},
                {"type": "paren", "value": ")"}
            ]

            expect(parser.parseExpression(tokens, 0))
                .to
                .eql(
                    {
                        "item": {
                            "type": "CallExpression",
                            "value": "loop",
                            "params": [
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
                                    "type": "CallExpression",
                                    "value": "$username",
                                    "params": []
                                },
                                {
                                    "type": "StringLiteral",
                                    "value": "3"
                                }
                            ]
                        },
                        "position": 6
                    }
                );
        });
    });
});
