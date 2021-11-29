export class Emitter {

    emitNumber = node => node.value;

    emitString = node =>  `"${node.value}"`

    emitProgram = node =>  node.body.map(exp => this.emitter(exp) + ";").join('\n');

    emitExpression = node => `${node.value}(${node.params.map(this.emitter).join(', ')})`

    emitter = node => {
        switch (node.type) {
            case 'Program': return this.emitProgram(node);
            case 'CallExpression': return this.emitExpression(node);
            case 'NumberLiteral': return this.emitNumber(node);
            case 'StringLiteral': return this.emitString(node);
            default:
                throw new TypeError(node.type);
        }
    }
}
