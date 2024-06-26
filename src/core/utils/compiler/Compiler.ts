import {Tokenizer} from "./Tokenizer";
import {Parser} from "./Parser";
import {Resolver} from "./Resolver";
import {IEvent} from "../../events/IEvent";

export class Compiler {

    private static instance: Compiler;

    private constructor() {}

    static getInstance(): Compiler {
        if (this.instance == null) {
            this.instance = new Compiler();
        }

        return this.instance;
    }

    public async compileString(input: string, originalEvent: IEvent): Promise<string> {
        let tokens = new Tokenizer().tokenizer(input);
        let program = new Parser().parseProgram(tokens);
        let output = Resolver.getInstance().resolve(program, originalEvent);

        // 'fix fertiger string';
        return output;
    }
}
