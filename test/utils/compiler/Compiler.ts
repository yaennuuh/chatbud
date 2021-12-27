import { expect } from 'chai';
import {Compiler} from "../../../src/core/utils/compiler/Compiler";
import {FunctionManager} from "../../../src/core/functions/FunctionManager";
import {CompilerHelper} from "../../../src/core/utils/compiler/CompilerHelper";

class DummyFunction2 {

    register(): string {
        return "username";
    }

    async execute(parsedItems: string[]): Promise<string> {
        return 'sam';
    }
}

class DummyFunction {

    register(): string {
        return "dummy";
    }

    async execute(parsedItems: string[]): Promise<string> {

        if (parsedItems && parsedItems.length > 0) {
            let val1 = await CompilerHelper.getInstance().resolveParameter(parsedItems[0]);
            let val2 = await CompilerHelper.getInstance().resolveParameter(parsedItems[1]);
            return `my params: '${val1}', '${val2}'`;
            return `my params {}`;
        }

        return '~dummy~';
    }
}

describe('Compiler', () =>
{
    describe('test compiler', () =>
    {
        before(() => {
            const functionManager = FunctionManager.getInstance();
            functionManager.registerFunction('dummy', new DummyFunction())
            functionManager.registerFunction('username', new DummyFunction2())
        })

        it('test compile simple string', async () => {
            let s = await Compiler.getInstance().compileString('Hello World');
            expect(s).to.eql("Hello World");
        });

        it('test compile keyword', async () => {
            let s = await Compiler.getInstance().compileString('Hello $dummy');
            expect(s).to.eql("Hello ~dummy~");
        });

        it('test compile function', async () => {
            let s = await Compiler.getInstance().compileString('$dummy("hallo $username", "error")');
            expect(s).to.eql("my params: 'hallo sam', 'error'");
        });

        it('test compile nested function', async () => {
            let s = await Compiler.getInstance().compileString('$dummy("first, $dummy("second $username" , "secondError")", "firstError")');
            expect(s).to.eql("my params: 'hallo sam', 'error'");
        });
    });
});
