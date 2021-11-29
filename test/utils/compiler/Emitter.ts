import { expect } from 'chai';
import {Emitter} from "../../../src/core/utils/compiler/Emitter";


describe('Emitter', () =>
{
    describe('test emitter', () =>
    {
        it('test emitNumber', () =>
        {
            let emitter = new Emitter();
            expect(emitter.emitNumber({
                "type": "number",
                "value": "2",
            }))
                .to
                .eql("2");
        });

        it('test emitString', () =>
        {
            let emitter = new Emitter();
            expect(emitter.emitString({
                "type": "number",
                "value": "Hello World!",
            }))
                .to
                .eql("\"Hello World!\"");
        });

        it('test emitter simple', () =>
        {
            let emitter = new Emitter();
            expect(emitter.emitter({
                "type": "CallExpression",
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
                ]
            }))
                .to
                .eql("subtract(4, 2)");
        });
    });
});
