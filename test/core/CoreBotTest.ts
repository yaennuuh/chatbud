import { expect } from 'chai';
import { CoreBot } from '../../src/core/CoreBot';
import {FunctionManager} from "../../src/core/functions/FunctionManager";

class DummyFunction {
    register(): string {
        return "dummy";
    }
    execute(params: string, content: string, packages: string[]): string[] {
        packages.unshift(content);
        return packages;
    }
}

describe('CoreBot', () =>
{
    describe('test packaginator', () =>
    {
        before(function() {
            let functionManager = FunctionManager.getInstance();
            let dummy = new DummyFunction();
            functionManager.registerFunction(dummy.register(), dummy);
        });

        it('should create one function package', () =>
        {
            let coreBot = CoreBot.getInstance();
            expect(coreBot.packaginator("[#dummy 5][#dummy 5]inner text[/#dummy][/#dummy]", ["dummy"]))
                .to
                .eql(['[#dummy 5][#dummy 5]inner text[/#dummy][/#dummy]']);
        });
        it('should create two function packages', () =>
        {
            let coreBot = CoreBot.getInstance();
            expect(coreBot.packaginator("[#dummy 5]text[/#dummy][#dummy 5]text[/#dummy]", ["dummy"]))
                .to
                .eql(['[#dummy 5]text[/#dummy]', '[#dummy 5]text[/#dummy]']);
        });
        it('should create one text package and two function packages', () =>
        {
            let coreBot = CoreBot.getInstance();
            expect(coreBot.packaginator("hallo [#dummy 5]text[/#dummy][#dummy 5]text[/#dummy]", ["dummy"]))
                .to
                .eql(['hallo ', '[#dummy 5]text[/#dummy]', '[#dummy 5]text[/#dummy]']);
        });
    });
    describe('test locations', () =>
    {
        it('should return all start indexes of the substring within the message', () =>
        {
            let coreBot = CoreBot.getInstance();
            expect(coreBot.locations("abc", "abc def abc ghi aha"))
                .to
                .eqls([0, 8]);
        });
    });
});
