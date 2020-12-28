class LoopFunction {

    register(): string {
        return "loop";
    }

    execute(packages: string[]): string[] {
        let pack: string = packages.shift();
        let stringToWork = pack.substring(7, pack.length - 8);
        let params = Number.parseInt(stringToWork.substring(0, stringToWork.indexOf(']')));
        let content = stringToWork.substring(stringToWork.indexOf(']') + 1, stringToWork.length);

        for(let i = 0; i < params; i++) {
            packages.unshift(content);
        }

        return packages;
    }
}

module.exports = LoopFunction;