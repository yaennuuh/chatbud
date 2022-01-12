import { expect } from 'chai';
import { Resolver } from "../../../src/core/utils/compiler/Resolver";
import { FunctionManager } from "../../../src/core/functions/FunctionManager";
import {IEvent} from "../../../src/core/events/IEvent";

class DummyFunction {

    register(): string {
        return "dummy";
    }

    async execute(parsedItems: string[], originalEvent: IEvent, functionHelper: any): Promise<string> {

        if (parsedItems && parsedItems.length > 0) {
            return `my params: '${parsedItems[0]}', '${parsedItems[1]}'`;
        }

        return '~dummy~';
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
            }, null);

            expect(s).to.eql("Hello World!");
        });

        it('test Resolver simple', async () => {

            let emitted = await Resolver.getInstance().resolve({
                "type": "Program",
                "body": [
                    { "type": "StringLiteral", "value": "hallo" },
                    { "type": "StringLiteral", "value": " " },
                    { "type": "function", "value": "$dummy" },
                    { "type": "StringLiteral", "value": " " },
                    { "type": "StringLiteral", "value": "du" },
                    { "type": "StringLiteral", "value": " " },
                    { "type": "keyword", "value": "$random" }
                ]
            }, null);

            expect(emitted).to.eql('hallo ~dummy~ du $random');
        });

        it('test Resolver simple', async () => {

            let emitted = await Resolver.getInstance().resolve({
                "type": "Program",
                "body": [
                    { "type": "StringLiteral", "value": "hallo" },
                    { "type": "StringLiteral", "value": " " },
                    { "type": "function", "value": "$dummy" },
                    { "type": "StringLiteral", "value": " " },
                    { "type": "StringLiteral", "value": "du" },
                    { "type": "StringLiteral", "value": " " },
                    { "type": "keyword", "value": "$random" }
                ]
            }, null);

            expect(emitted).to.eql('hallo ~dummy~ du $random');
        });

        it('test Resolver nestes', async () => {

            let emitted = await Resolver.getInstance().resolve(
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
            ,null);

            expect(emitted).to.eql('my params: \'first\', \'$dummy("second $username""secondError x")\'');
        });
    });
});
