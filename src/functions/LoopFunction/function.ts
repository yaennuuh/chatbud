class LoopFunction {

    register(): string {
        return "loop";
    }

    execute(params: string[], content: string, packages: string[]): string[] {
        for(let i = 0; i < Number.parseInt(params[0]); i++) {
            packages.unshift(content);
        }

        return packages;
    }
}

module.exports = LoopFunction;