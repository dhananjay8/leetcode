class MinStack {
  constructor() {
    this.stack = [];
  }
  /**
   * @param {number} val
   * @return {void}
   */
  push(val) {
    this.stack.push({
      value: val,
      min: this.stack.length ? Math.min(val, this.getMin()) : val,
    });
  }
  /**
   * @return {void}
   */
  pop() {
    this.stack.pop();
  }
  /**
   * @return {number}
   */
  top() {
    return this.stack[this.stack.length - 1].value;
  }
  /**
   * @return {number}
   */
  getMin() {
    return this.stack[this.stack.length - 1].min;
  }
}
/**
 * Your MinStack object will be instantiated and called as such:
 * const obj = new MinStack();
 * obj.push(val);
 * obj.pop();
 * const param3 = obj.top();
 * const param4 = obj.getMin();
 */

var MinStack = function () {
  this.stack = [];
};

/**
 * @param {number} val
 * @return {void}
 */
MinStack.prototype.push = function (val) {
  this.stack.push({
    value: val,
    min: this.stack.length ? Math.min(val, this.getMin()) : val,
  });
};

/**
 * @return {void}
 */
MinStack.prototype.pop = function () {
  this.stack.pop();
};

/**
 * @return {number}
 */
MinStack.prototype.top = function () {
  return this.stack[this.stack.length - 1].value;
};

/**
 * @return {number}
 */
MinStack.prototype.getMin = function () {
  return this.stack[this.stack.length - 1].min;
};

/**
 * Your MinStack object will be instantiated and called as such:
 * var obj = new MinStack()
 * obj.push(val)
 * obj.pop()
 * var param_3 = obj.top()
 * var param_4 = obj.getMin()
 */
