class TempoEstimator {
  constructor(beatManager) {
    this.beatManager = beatManager;
  }

  estimateTempo(time) {
    const { beats } = this.beatManager;
    if (beats.length < 2) {
      return 0;
    }

    const idx = this.beatManager.binarySearchLE(beats, time);

    // Handle edge cases where there is not enough information to
    // interpolate or extrapolate.
    if (beats.length < 2) {
      return 0;
    } else if (idx == -1 || idx >= beats.length - 1) {
      return this.beatManager.getAverageTempo(beats.length - 1, 2);
    }

    // Compute interpolation time.
    const t = (time - beats[idx]) / (beats[idx + 1] - beats[idx]);

    // Compute reference points, with extrapolation if needed.
    const p1 = [beats[idx], this.beatManager.getAverageTempo(idx)];
    const p2 = [beats[idx + 1], this.beatManager.getAverageTempo(idx + 1)];
    const p0 = (idx - 1 >= 0)
      ? [beats[idx - 1], this.beatManager.getAverageTempo(idx - 1)]
      : [p1[0] - 0.001, p1[1]];
    const p3 = (idx + 2 < beats.length)
      ? [beats[idx + 2], this.beatManager.getAverageTempo(idx + 2)]
      : [p2[0] + 0.001, p2[1]];

    return this.sampleCatmullRom(t, p0, p1, p2, p3);
  }

  render(timelineState) {
    const { beats } = this.beatManager;
    const { ctx, curTime, windowMin, windowMax, windowWidth, windowHeight } = timelineState;

    const height = windowHeight / 2;
    const scale = Math.min(100, windowHeight / 2);

    let max_tempo = 0, min_tempo = 0;
    const samples = [];
    const segments = 400;
    const sampleRate = (windowMax - windowMin) / segments;

    const start = Math.max(0, windowMin);
    const end = Math.min(windowMax, Math.max(beats[beats.length - 1], curTime));

    for (let t = start; t <= end; t += sampleRate) {
      const tempo = this.estimateTempo(t);
      min_tempo = Math.min(tempo, min_tempo);
      max_tempo = Math.max(tempo, max_tempo);
      samples.push([t, tempo]);
    }

    ctx.beginPath();
    for (let i = 0; i < samples.length; i++) {
      let t, tempo;
      [t, tempo] = samples[i];
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

  // Samples must contain four values
  // https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
  sampleCatmullRom(time, p0, p1, p2, p3) {
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

  getT(t, alpha, p0, p1) {
    const deltaX = p1[0] - p0[0];
    const deltaY = p1[1] - p0[1];
    const dist2 = deltaX * deltaX + deltaY * deltaY;
    return t + Math.pow(dist2, alpha * 0.5);
  }
}