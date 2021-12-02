export class Emitter {

    emitString = node =>  `${node.value}`

    emitProgram = node =>  node.body.map(exp => this.emitter(exp)).join(' ');

    emitExpression1 = node => `${node.value}${node.params ? node.params.forEach((val) => {
        val.map(this.emitter).join(', ');
    }) : ''}`

    emitExpression = node => {
        let inner = '';

        if(node.params != undefined && node.params.length > 0){
            node.params.forEach((val) => {
                inner = inner + val.map(this.emitter).join(', ');
            })
        }

        if(node.value == '$alert'){
            node.value = '!!!';
        }
        if(node.value == '$username'){
            node.value = 'barrex';
        }
        if(node.value == '$points'){
            node.value = '10';
        }
        if(node.value == '$random'){
            node.value = 'gugus';
        }

        return `${node.value} ${inner}`
    }

    emitter = node => {
        switch (node.type) {
            case 'Program': return this.emitProgram(node);
            case 'StringLiteral': return this.emitString(node);
            case 'function': return this.emitExpression(node);
            case 'keyword': return this.emitExpression(node);
            default:
                throw new TypeError(node.type);
        }
    }
}
