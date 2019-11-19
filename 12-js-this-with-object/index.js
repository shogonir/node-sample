function displayName() {
  console.log(this.name);
}

const obj1 = {
  name: 'object one',
  displayName: displayName
}

const obj2 = {
  name: 'object two',
  displayName: displayName
}

const obj3 = {
  displayName: displayName
}

displayName();
obj1.displayName();
obj2.displayName();
obj3.displayName();