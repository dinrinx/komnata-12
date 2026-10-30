// Пресеты стоек эффектов по годам. 4 слота на голос, прыжок переключает все разом.
// slot: { key, wet, value } — value — значение главного параметра эффекта.
const slot = (key, wet, value) => ({ key, wet, value });
const empty = () => ({ key: '', wet: 1, value: undefined });

export const VOICE_FX_PRESETS = {
  2005: {
    voice: [slot('distortion', 0.6, 0.5), slot('chorus', 0.5, 0.6), slot('feedbackDelay', 0.35, 0.22) /* слэпбэк 120мс задаётся delayTime отдельно */, empty()],
    minus: [slot('distortion', 0.5, 0.4), slot('chorus', 0.4, 0.5), slot('phaser', 0.4, 0.6), empty()],
    bass: [slot('distortion', 0.5, 0.35), slot('autoFilter', 0.6, 3), empty(), empty()],
    drums: [slot('bitCrusher', 0.7, 5), slot('distortion', 0.4, 0.3), empty(), empty()],
  },
  2017: {
    voice: [slot('vibrato', 0.4, 0.2), slot('freeverb', 0.5, 0.6), slot('pingPongDelay', 0.3, 0.25), empty()],
    minus: [slot('tremolo', 0.4, 0.3), slot('reverb', 0.4, 1.5), empty(), empty()],
    bass: [slot('autoFilter', 0.5, 220), slot('reverb', 0.3, 0.8), empty(), empty()],
    drums: [slot('bitCrusher', 0.3, 12), slot('autoPanner', 0.4, 0.5), empty(), empty()],
  },
};

export const EXTRA_SLOT_TIMES = {
  voice2005FeedbackDelay: 0.12, // слэпбэк 120 мс
};

export const MASTER_FX_PRESET = [slot('stereoWidener', 0.5, 0.6), slot('reverb', 0.25, 1.2)];
