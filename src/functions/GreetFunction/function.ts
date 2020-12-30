class GreetFunction {

    register(): string {
        return "greet";
    }

    execute(params: string[], content: string, packages: string[]): string[] {
        packages.unshift('hallo ' + content)

        return packages;
    }
}

module.exports = GreetFunction;