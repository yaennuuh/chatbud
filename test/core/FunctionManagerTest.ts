import { expect } from 'chai';
import {FunctionManager} from "../../src/core/functions/FunctionManager";

class DummyFunction{

    register(): string {
        return "dummy";
    }

    execute(params: string, content: string, packages: string[]): string[] {
        packages.unshift(`params:'${params}' content:'${content}'`);
        return packages;
    }
}

describe('FunctionManager', () =>
{
    before(function() {
        let functionManager = FunctionManager.getInstance();
        let dummy = new DummyFunction();
        functionManager.registerFunction(dummy.register(), dummy);
    });
    describe('test registerFunction', () =>
    {
        before(function() {
            let functionManager = FunctionManager.getInstance();
            let anotherDummy = new DummyFunction();
            functionManager.registerFunction("anotherDummy", anotherDummy);
        });
        it('should have two registered functions', () =>
        {
            let functionManager = FunctionManager.getInstance();
            expect(functionManager.functionMap.size)
                .to
                .eql(2);
        });
    });
    describe('test sendToFunction', () =>
    {
        it('should process the dummy function', () =>
        {
            let functionManager = FunctionManager.getInstance();
            let functionKey = "dummy";
            let packages = ['[#dummy]text[/#dummy]', 'other package'];
            expect(functionManager.sendToFunction(functionKey, packages, null))
                .to
                .eqls(["params:'' content:'text'", 'other package']);
        });
        it('should process the dummy function with params', () =>
        {
            let functionManager = FunctionManager.getInstance();
            let functionKey = "dummy";
            let packages = ['[#dummy 3 true]text[/#dummy]', 'other package'];
            expect(functionManager.sendToFunction(functionKey, packages, null))
                .to
                .eqls(["params:'3 true' content:'text'", 'other package']);
        });
    });
    describe('test getFunctionKeyWords', () =>
    {
        before(function() {
            let functionManager = FunctionManager.getInstance();
            let anotherDummy = new DummyFunction();
            functionManager.registerFunction("anotherDummy", anotherDummy);
        });
        it('should return all function keywords', () =>
        {
            let functionManager = FunctionManager.getInstance();
            expect(functionManager.getFunctionKeyWords())
                .to
                .eqls(['dummy', 'anotherDummy']);
        });
    });
});
