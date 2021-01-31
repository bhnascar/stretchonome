// CRUD operations on a sorted array.
class BeatManager {
  constructor() {
    this.beats = [];
  }

  clear() {
    this.beats.length = 0;
  }

  getTempo(idx) {
    if (idx < 1 || idx >= this.beats.length) {
      return 0;
    }
    return 60 / (this.beats[idx] - this.beats[idx - 1]);
  }

  // TODO: Weighted average?
  getAverageTempo(idx, windowSize = 1) {
    if (idx < 1 || idx >= this.beats.length) {
      return 0;
    }
    let increments = 1;
    let avg = this.getTempo(idx);
    for (let i = 1; i <= windowSize; i++) {
      if (idx - i > 0) {
        avg += this.getTempo(idx - i);
        increments++;
      }
      if (idx + i < this.beats.length) {
        avg += this.getTempo(idx + i);
        increments++;
      }
    }
    return avg / increments;
  }

  addBeat(time) {
    let idx = this.binarySearchGE(this.beats, time);
    if (idx < 0) {
      idx = this.beats.length;
    }
    if (idx < this.beats.length && this.beats[idx] == time) {
      return;
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

  binarySearchLE(arr, target) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      if (arr[mid] <= target && (mid == arr.length || arr[mid + 1] > target)) {
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