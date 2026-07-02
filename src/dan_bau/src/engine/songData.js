import beatmap from '../data/beo-dat-may-troi.beatmap.json';

// Beatmap was authored with A,W,E,D,X,Z keys; remap to physical A,S,D,J,K,L
const KEY_REMAP = { w: 's', e: 'd', d: 'j', x: 'k', z: 'l' };

function getBendHint(note) {
  if (note.type === 'vibrato' || note.vibrato) return 'vibrato';
  if (note.type === 'bend') return 'up';
  return 'none';
}

function normalizeNote(note, index) {
  const rawKey = note.key.toLowerCase();
  const key = KEY_REMAP[rawKey] ?? rawKey;
  return {
    id: note.id ?? index + 1,
    time: note.time / 1000,
    key,
    noteName: note.noteName,
    type: note.type ?? 'normal',
    duration: note.duration ?? 1,
    bend: getBendHint(note),
    isBend: Boolean(note.bend) || note.type === 'bend',
    vibrato: Boolean(note.vibrato) || note.type === 'vibrato',
  };
}

export const beoDatMayTroiFullBeatmap = {
  id: beatmap.id,
  title: beatmap.title,
  duration: beatmap.duration / 1000,
  durationMs: beatmap.duration,
  bpm: beatmap.bpm ?? beatmap.bpmEstimate,
  backingTrack: beatmap.backingTrack,
  keyMap: beatmap.keyMap,
  notes: beatmap.notes.map(normalizeNote),
};

export const BEO_DAT_MAY_TROI = beoDatMayTroiFullBeatmap;
export const SONG_TITLE = BEO_DAT_MAY_TROI.title;
export const SONG_DURATION = BEO_DAT_MAY_TROI.duration;
export const SONG_NOTES = BEO_DAT_MAY_TROI.notes;
