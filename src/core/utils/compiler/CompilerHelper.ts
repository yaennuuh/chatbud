import { IEvent } from "../../events/IEvent";
import {Compiler} from "./Compiler";

export class CompilerHelper {
    private static instance: CompilerHelper;

    private constructor() {}

    static getInstance(): CompilerHelper {
        if (this.instance == null) {
            this.instance = new CompilerHelper();
        }

        return this.instance;
    }

    public resolveParameter(parsedItem: string, originalEvent: IEvent): Promise<string> {
        return Compiler.getInstance().compileString(parsedItem, originalEvent);
    }
}
