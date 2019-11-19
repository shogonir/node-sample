const User = function(name) {
  this.name = name;
}

User.prototype = {
  displayName: function() {
    console.log(this.name);
  }
}

const shogo = new User('shogonir');
shogo.displayName();