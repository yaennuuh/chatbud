import { expect } from 'chai';
import {Emitter} from "../../../src/core/utils/compiler/Emitter";


describe('Emitter', () =>
{
    describe('test emitter', () =>
    {
        it('test emitString', () =>
        {
            let emitter = new Emitter();
            expect(emitter.emitString({
                "type": "number",
                "value": "Hello World!",
            }))
                .to
                .eql("Hello World! ");
        });

        it('test emitter simple', () =>
        {
            let emitter = new Emitter();
            expect(emitter.emitter({
                "type": "Program",
                "body": [
                    {"type": "StringLiteral", "value": "hallo"},
                    {"type": "function", "value": "$alert", "params": [
                            [
                                {"type": "keyword", "value": "$username"}
                            ],
                            [
                                {"type": "StringLiteral", "value": "you got"},
                                {"type": "keyword", "value": "$points"}
                            ]
                        ]},
                    {"type": "StringLiteral", "value": "du"},
                    {"type": "keyword", "value": "$random"}
                ]
            }))
                .to
                .eql({});
        });
    });
});
