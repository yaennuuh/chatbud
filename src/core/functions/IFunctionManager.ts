export interface IFunctionManager {
    loadFunctions(): void;
    registerFunction(functionKeyword: string, functionInstance: any): void;
    getFunctionKeyWords(): string[];
    sendToFunction(functionKey: string, packages: string[]): string[];
}