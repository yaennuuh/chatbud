import { expect } from 'chai';
const loopFunctionClass = require("../../src/functions/LoopFunction/function");

describe('LoopFunction', () =>
{
    describe('test loop function', () =>
    {
        it('should add the text content twice to the packages', () =>
        {
            let loopFunction = new loopFunctionClass();
            let params = "2";
            let content = "text";
            let packages = ['next package', 'other package'];
            expect(loopFunction.execute(params, content, packages))
                .to
                .eql(['text', 'text', 'next package', 'other package']);
        });
        it('should add the nested function twice to the packages', () =>
        {
            let loopFunction = new loopFunctionClass();
            let params = "2";
            let content = "[#wait 4]inner text[/#wait]";
            let packages = ['next package'];
            expect(loopFunction.execute(params, content, packages))
                .to
                .eql(['[#wait 4]inner text[/#wait]', '[#wait 4]inner text[/#wait]', 'next package']);
        });
    });
});
