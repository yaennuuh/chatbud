import {Compiler} from "./Compiler";
import {Parsed} from "./Parser";

export class CompilerHelper {
    private static instance: CompilerHelper;

    private constructor() {}

    static getInstance(): CompilerHelper {
        if (this.instance == null) {
            this.instance = new CompilerHelper();
        }

        return this.instance;
    }

    public resolveParameter(parsedItem: string): Promise<string> {
        return Compiler.getInstance().compileString(parsedItem);
    }
}
