class Queue {
  constructor() {
    this.store = [];
  }
  enQueue(item) {
    this.store.push(item);
  }
  deQueue() {
    return this.store.shift();
  }
  size() {
    return this.store.length;
  }
  peek() {
    return this.store(this.size() - 1);
  }
}
