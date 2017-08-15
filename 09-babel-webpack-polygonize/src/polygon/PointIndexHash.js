// @flow

export default class PointIndexHash {

  hash: { [pointIndex: number]: Array<number> };

  constructor(valueList: Array<Array<number>>) {
    this.hash = {};
    let self: PointIndexHash = this;
    valueList.forEach((value: Array<number>, index: number) => {
      value.forEach((element: number) => {
        self.push(element, index);
      });
    });
  }

  push(key: number, value: number) {
    if (this.hash[key] == null) {
      this.hash[key] = [];
    }
    this.hash[key].push(value);
  }
}
