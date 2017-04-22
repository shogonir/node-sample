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

