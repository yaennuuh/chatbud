import { expect } from 'chai';
import {Compiler} from "../../../src/core/utils/compiler/Compiler";
import {FunctionManager} from "../../../src/core/functions/FunctionManager";
import {CompilerHelper} from "../../../src/core/utils/compiler/CompilerHelper";
import { IEvent } from '../../../src/core/events/IEvent';

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

    async execute(parsedItems: string[], originalEvent: IEvent, functionHelper: any): Promise<string> {

        if (parsedItems && parsedItems.length > 0) {
            let val1 = await functionHelper.resolveParameter(parsedItems[0], originalEvent);
            let val2 = await functionHelper.resolveParameter(parsedItems[1], originalEvent);
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
            let s = await Compiler.getInstance().compileString('Hello World', null);
            expect(s).to.eql("Hello World");
        });

        it('test compile keyword', async () => {
            let s = await Compiler.getInstance().compileString('Hello $dummy', null);
            expect(s).to.eql("Hello ~dummy~");
        });

        it('test compile function', async () => {
            let s = await Compiler.getInstance().compileString('$dummy("hallo $username", "error")', null);
            expect(s).to.eql("my params: 'hallo sam', 'error'");
        });

        it('test compile nested function', async () => {
            let s = await Compiler.getInstance().compileString('$dummy("first, $dummy("second $username" , "secondError")", "firstError")', null);
            expect(s).to.eql("my params: 'hallo sam', 'error'");
        });
    });
});
