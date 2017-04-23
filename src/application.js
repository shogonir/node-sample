import Person from './person';

class Friend extends Person{

    constructor(name) {
        super(name);
    }


    callName() {
        console.log(this.name);
    }
}

let shogonir = new Friend('Shogo N');

shogonir.callName();


// test es2016 syntax

let power = 3 ** 3;

console.log('3 ** 3 = ' + power);

let array = [1, 2, 3];

console.log('1 in array? : ' + array.includes(1));

console.log('0 in array? : ' + array.includes(0));

