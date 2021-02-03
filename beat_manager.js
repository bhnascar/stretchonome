// CRUD operations on a sorted array.
class BeatManager {
  constructor() {
    this.beats = [];

    // Gaussian weights for averaging.
    this.weights = [
      0.19387, 0.24477, 0.06136
    ];
  }

  clear() {
    this.beats.length = 0;
  }

  getTempo(idx) {
    if (this.beats.length < 2) {
      return 0;
    }
    idx = Math.max(1, Math.min(this.beats.length - 1, idx));
    return 60 / (this.beats[idx] - this.beats[idx - 1]);
  }

  getAverageTempo(idx) {
    let avg = 0;
    for (let i = 0; i < this.weights.length; i++) {
      avg += this.weights[i] * this.getTempo(idx - i);
      avg += this.weights[i] * this.getTempo(idx + i);
    }
    return avg;
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
      if (arr[mid] <= target && (mid == arr.length - 1 || arr[mid + 1] > target)) {
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