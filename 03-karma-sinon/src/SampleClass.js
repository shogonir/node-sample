export default class SampleClass {
  
  constructor() {
  }

  fetchJson(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.text();
      });
  }

  sumAppleAndOrange(url) {
    return new Promise((resolve, reject) => {
      this.fetchJson(url)
        .then(jsonString => {
          let sum = 0;
          let json = JSON.parse(jsonString);
          if (json.apple) {
            sum += this.sumArray(json.apple);
          }
          if (json.orange) {
            sum += this.sumArray(json.orange);
          }
          resolve(sum);
        });
    });
  }

  sumArray(arr) {
    return arr.reduce((prev, current) => {
      return prev + current;
    });
  }
}

