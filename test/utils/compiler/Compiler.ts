import { expect } from 'chai';
import {Compiler} from "../../../src/core/utils/compiler/Compiler";


describe('Compiler', () =>
{
    describe('test compiler', () =>
    {
        it('test compiler', () =>
        {
            let compiler = new Compiler();
            expect(compiler.my_compiler("(add 1 2 (mult 3 4))"))
                .to
                .eql("add(1, 2, mult(3, 4));");
        });

        it('test compiler', () =>
        {
            let compiler = new Compiler();
            expect(compiler.my_compiler('(print "asdf")'))
                .to
                .eql('print("asdf");');
        });
    });
});
