const User = function(name) {
  
  this.name = name;

  this.displayName = function() {
    console.log(this.name);
  }
}

const shogo = new User('shogonir');
shogo.displayName();