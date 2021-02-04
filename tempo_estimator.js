class TempoEstimator {
  constructor(beatManager) {
    this.beatManager = beatManager;
  }

  estimateTempo(time) {
    const { beats } = this.beatManager;
    if (beats.length < 2) {
      return 0;
    }
    let idx = this.beatManager.binarySearchLE(beats, time);
    const cmParams = this.getCatmullRomParams(idx);
    return this.sampleCatmullRom(time, cmParams);
  }

  estimateAcceleration(time) {
    const { beats } = this.beatManager;
    if (beats.length < 2) {
      return 0;
    }
    let idx = this.beatManager.binarySearchLE(beats, time);
    const cmParams = this.getCatmullRomParams(idx);
    return this.sampleCatmullRomDerivative(time, cmParams);
  }

  render(timelineState) {
    const { beats } = this.beatManager;
    if (beats.length < 2) {
      return;
    }

    const { ctx, curTime, windowMin, windowMax, windowWidth, windowHeight } = timelineState;

    const height = windowHeight / 2;
    const scale = Math.min(100, windowHeight / 2);

    const samples = [];
    const segments = 300;
    const sampleRate = (windowMax - windowMin) / segments;

    const start = Math.max(0, windowMin);
    const end = Math.min(windowMax, Math.max(beats[beats.length - 1], curTime));

    let cmParams = {};
    let max_tempo = 0, min_tempo = 0;
    for (let time = start; time <= end; time += sampleRate) {
      if (!cmParams.p2 || time > cmParams.p2[0]) {
        const idx = this.beatManager.binarySearchLE(beats, time);
        cmParams = this.getCatmullRomParams(idx, time);
      }
      const tempo = this.sampleCatmullRom(time, cmParams);
      min_tempo = Math.min(tempo, min_tempo);
      max_tempo = Math.max(tempo, max_tempo);
      samples.push([time, tempo]);
    }

    ctx.beginPath();
    ctx.lineWidth = 2;
    for (let i = 0; i < samples.length; i++) {
      let [t, tempo] = samples[i];
      const normalizedTempo = (tempo - min_tempo) / (max_tempo - min_tempo);
      const x = windowWidth * (t - windowMin) / (windowMax - windowMin);
      const y = height - scale * (normalizedTempo - 0.5);
      if (i == 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = '#999';
    ctx.stroke();
  }

  getCatmullRomParams(idx) {
    const { beats } = this.beatManager;

    // Clamp to valid range.
    idx = Math.max(0, Math.min(beats.length - 2, idx));

    // Compute reference points, with extrapolation if needed.
    const p1 = [beats[idx], this.beatManager.getAverageTempo(idx)];
    const p2 = [beats[idx + 1], this.beatManager.getAverageTempo(idx + 1)];
    const p0 = (idx - 1 >= 0)
      ? [beats[idx - 1], this.beatManager.getAverageTempo(idx - 1)]
      : [-(p2[0] - p1[0]), p1[1] - (p2[1] - p1[1])];
    const p3 = (idx + 2 < beats.length)
      ? [beats[idx + 2], this.beatManager.getAverageTempo(idx + 2)]
      : [p2[0] + (p2[0] - p1[0]), p2[1] + (p2[1] - p1[1])];

    return { p0, p1, p2, p3 };
  }

  // Samples must contain four values
  // https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
  sampleCatmullRom(time, params) {
    const { p0, p1, p2, p3 } = params;

    time = (time - p1[0]) / (p2[0] - p1[0]);
    time = Math.max(0, Math.min(1, time));
    
    const t0 = 0;
    const t1 = this.getT(t0, 0.5, p0, p1);
    const t2 = this.getT(t1, 0.5, p1, p2);
    const t3 = this.getT(t2, 0.5, p2, p3);
    const t = (1 - time) * t1 + time * t2;

    const a1 = ((t1 - t) * p0[1] + (t - t0) * p1[1]) / (t1 - t0);
    const a2 = ((t2 - t) * p1[1] + (t - t1) * p2[1]) / (t2 - t1);
    const a3 = ((t3 - t) * p2[1] + (t - t2) * p3[1]) / (t3 - t2);
    const b1 = ((t2 - t) * a1 + (t - t0) * a2) / (t2 - t0);
    const b2 = ((t3 - t) * a2 + (t - t1) * a3) / (t3 - t1);
    return ((t2 - t) * b1 + (t - t1) * b2) / (t2 - t1);
  }

  sampleCatmullRomDerivative(time, params) {
    const { p0, p1, p2, p3 } = params;

    time = (time - p1[0]) / (p2[0] - p1[0]);
    time = Math.max(0, Math.min(1, time));

    const t0 = 0;
    const t1 = this.getT(t0, 0.5, p0, p1);
    const t2 = this.getT(t1, 0.5, p1, p2);
    const t3 = this.getT(t2, 0.5, p2, p3);
    const t = (1 - time) * t1 + time * t2;

    const a1 = ((t1 - t) * p0[1] + (t - t0) * p1[1]) / (t1 - t0);
    const a2 = ((t2 - t) * p1[1] + (t - t1) * p2[1]) / (t2 - t1);
    const a3 = ((t3 - t) * p2[1] + (t - t2) * p3[1]) / (t3 - t2);
    const b1 = ((t2 - t) * a1 + (t - t0) * a2) / (t2 - t0);
    const b2 = ((t3 - t) * a2 + (t - t1) * a3) / (t3 - t1);

    const a1_p = (p1[1] - p0[1]) / (t1 - t0);
    const a2_p = (p2[1] - p1[1]) / (t2 - t1);
    const a3_p = (p3[1] - p2[1]) / (t3 - t2);
    const b1_p = (a2 - a1 + (t2 - t) * a1_p + (t - t0) * a2_p) / (t2 - t0);
    const b2_p = (a3 - a2 + (t3 - t) * a2_p + (t - t1) * a3_p) / (t3 - t1);
    return (b2 - b1 + (t2 - t) * b1_p + (t - t1) * b2_p) / (t2 - t1);
  }

  getT(t, alpha, p0, p1) {
    const deltaX = p1[0] - p0[0];
    const deltaY = p1[1] - p0[1];
    const dist2 = deltaX * deltaX + deltaY * deltaY;
    return t + Math.pow(dist2, alpha * 0.5);
  }
}
