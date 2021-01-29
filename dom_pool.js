class DOMPool {
  constructor() {
    this.freeLists = {};
  }

  drain() {
    this.freeLists = {};
  }

  getNode(tagName) {
    let freeList = this.freeLists[tagName];
    if (freeList && freeList.length > 0) {
      const node = freeList.pop();
      return node;
    }
    return document.createElement(tagName);
  }

  putNode(node) {
    const tagName = node.tagName.toLowerCase();
    let freeList = this.freeLists[tagName];
    if (!freeList) {
      freeList = [];
      this.freeLists[tagName] = freeList;
    }
    freeList.push(node);
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
}