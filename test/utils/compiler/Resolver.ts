import { expect } from 'chai';
import { Resolver } from "../../../src/core/utils/compiler/Resolver";
import { FunctionManager } from "../../../src/core/functions/FunctionManager";

class DummyFunction {

    register(): string {
        return "dummy";
    }

    execute(params: string[]): string {
        return '-dummy-';
    }
}


describe('Resolver', () => {
    describe('test Resolver', () => {
        before(() => {
            const functionManager = FunctionManager.getInstance();
            functionManager.registerFunction('dummy', new DummyFunction())
        })

        it('test emitString', async () => {

            let s = await Resolver.getInstance().resolveItem({
                "type": "StringLiteral",
                "value": "Hello World!",
            });

            expect(s).to.eql("Hello World!");
        });

        it('test Resolver simple', async () => {

            let emitted = await Resolver.getInstance().resolve({
                "type": "Program",
                "body": [
                    { "type": "StringLiteral", "value": "hallo" },
                    {
                        "type": "function", "value": "$dummy", "params": [
                            [
                                { "type": "keyword", "value": "$username" }
                            ],
                            [
                                { "type": "StringLiteral", "value": "you got" },
                                { "type": "keyword", "value": "$points" }
                            ]
                        ]
                    },
                    { "type": "StringLiteral", "value": "du" },
                    { "type": "keyword", "value": "$random" }
                ]
            });

            expect(emitted).to.eql('hallo -dummy- du $random');
        });
    });
});
