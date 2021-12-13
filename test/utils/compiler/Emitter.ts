import { expect } from 'chai';
import {Emitter} from "../../../src/core/utils/compiler/Emitter";
import {FunctionManager} from "../../../src/core/functions/FunctionManager";

class DummyFunction {

    register(): string {
        return "dummy";
    }

    // execute(params: string[], originalEvent: any, helper: any): string {
    execute(params: string[]): string {

        return '-dummy-';
    }
}


describe('Emitter', () =>
{
    describe('test emitter', () =>
    {
        before(() => {

            const functionManager = FunctionManager.getInstance();
            functionManager.registerFunction('dummy', new DummyFunction())
        })

        it('test emitString', () =>
        {
            let emitter = new Emitter();
            expect(emitter.emitString({
                "type": "StringLiteral",
                "value": "Hello World!",
            }))
                .to
                .eql("Hello World!");
        });

        it('test emitter simple', () =>
        {
            let emitter = new Emitter();

            emitter.emitter({
                "type": "Program",
                "body": [
                    {"type": "StringLiteral", "value": "hallo"},
                    {"type": "function", "value": "$dummy", "params": [
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
            }).then((asdf) => {
                expect(asdf)
                    .to
                    .eql({});
            })


        });
    });
});
