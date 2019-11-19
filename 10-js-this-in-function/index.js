globalNumber = 123;

function func() {
  console.log(this);
  console.log(this.globalNumber);
}

func();