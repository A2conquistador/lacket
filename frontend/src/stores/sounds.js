let _ctx = null;
const getCtx = () => { if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)(); return _ctx; };
const playTone = (freq, type, dur, vol=0.3, delay=0) => {
  try {
    if (localStorage.getItem('lacket_sound') === 'off') return;
    const ctx=getCtx(), o=ctx.createOscillator(), g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type=type; o.frequency.value=freq;
    const s=ctx.currentTime+delay;
    g.gain.setValueAtTime(0,s);
    g.gain.linearRampToValueAtTime(vol,s+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,s+dur);
    o.start(s); o.stop(s+dur);
  } catch {}
};

export const sounds = {
  correct:    () => { playTone(523,'sine',0.15,0.25); playTone(659,'sine',0.2,0.25,0.1); playTone(784,'sine',0.3,0.25,0.2); },
  wrong:      () => { playTone(300,'sawtooth',0.15,0.2); playTone(250,'sawtooth',0.25,0.2,0.12); },
  timeUp:     () => { playTone(440,'sawtooth',0.1,0.2); playTone(330,'sawtooth',0.1,0.2,0.1); playTone(220,'sawtooth',0.4,0.2,0.2); },
  streak:     () => { playTone(659,'sine',0.1,0.2); playTone(784,'sine',0.1,0.2,0.08); playTone(1047,'sine',0.3,0.25,0.16); },
  packOpen:   () => { [0,0.08,0.16,0.24,0.32].forEach((d,i)=>playTone(300+i*80,'sine',0.12,0.15,d)); playTone(880,'sine',0.5,0.3,0.5); },
  packReveal: () => { playTone(523,'sine',0.1,0.2); playTone(659,'sine',0.1,0.2,0.08); playTone(784,'sine',0.1,0.2,0.16); playTone(1047,'sine',0.5,0.35,0.24); },
  dust:       () => { playTone(400,'triangle',0.1,0.15); playTone(300,'triangle',0.1,0.15,0.1); playTone(200,'triangle',0.3,0.1,0.2); },
  notif:      () => { playTone(880,'sine',0.12,0.15); playTone(1100,'sine',0.2,0.15,0.1); },
  click:      () => playTone(600,'sine',0.08,0.1),
  equip:      () => { playTone(440,'sine',0.1,0.15); playTone(550,'sine',0.15,0.15,0.1); },
  gameOver:   () => { playTone(440,'sawtooth',0.2,0.3); playTone(349,'sawtooth',0.2,0.3,0.2); playTone(294,'sawtooth',0.2,0.3,0.4); playTone(220,'sawtooth',0.6,0.3,0.6); },
  levelUp:    () => { [523,659,784,1047].forEach((f,i)=>playTone(f,'sine',0.15,0.3,i*0.1)); },
  countdown:  () => playTone(880,'sine',0.08,0.2),
  join:       () => { playTone(440,'sine',0.1,0.15); playTone(660,'sine',0.2,0.15,0.1); },
};
