// CRUD operations on a sorted array.
class BeatManager {
  constructor() {
    this.beats = [];
  }

  clear() {
    this.beats.length = 0;
  }

  addBeat(time) {
    let idx = this.binarySearchGE(this.beats, time);
    if (idx == -1) {
      idx = this.beats.length;
    }
    this.beats.splice(idx, 0, time);
  }

  removeBeat(time) {
    const idx = this.binarySearchGE(this.beats, time);
    if (idx > 0) {
      this.beats.splice(idx, 1);
    }
  }

  binarySearchGE(arr, target) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      if (arr[mid] >= target && (mid == 0 || arr[mid - 1] < target)) {
        return mid;
      }
      if (arr[mid] < target) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    return -1;
  }
}