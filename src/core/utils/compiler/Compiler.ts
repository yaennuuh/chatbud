import {Tokenizer} from "./Tokenizer";
import {Parser} from "./Parser";
import {Emitter} from "./Emitter";

export class Compiler {

    my_compiler (input): any {
        let tokens = new Tokenizer().tokenizer(input);
        let ast    = new Parser().parseProgram(tokens);
        let output = new Emitter().emitter(ast);

        return output;
    }

}
