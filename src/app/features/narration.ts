import { $, toast } from '../dom';
import { L, t } from '../i18n';
import { S, SPEEDS } from '../state';
import { menuOpen, refreshToggles } from '../views/menu';
import { onRender, render } from '../views/viewer';
import { hooks, next, stop } from './playback';

const supported = () => !!window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';

/** Reads a step message aloud in the page language, at the playback speed (rate 0.7–1.6). */
function speak(text: string): void {
  if (!supported()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = S.lang === 'hi' ? 'hi-IN' : 'en-IN';
  const voices = speechSynthesis.getVoices();
  const v = voices.find((x) => x.lang === u.lang) || voices.find((x) => x.lang.startsWith(S.lang));
  if (v) u.voice = v;
  u.rate = Math.min(1.6, Math.max(0.7, SPEEDS[S.speedIdx]));
  // While playing, the next step starts 250 ms after the speech ends.
  u.onend = () => {
    if (S.playing)
      S.timer = setTimeout(() => {
        if (!next(true)) stop();
      }, 250);
  };
  speechSynthesis.speak(u);
}

export function initNarration(): void {
  hooks.pacedElsewhere = () => {
    if (!S.voice || !supported()) return false;
    // Speech paces playback: each utterance's end schedules the next step. If nothing is being
    // spoken yet (play was just pressed), start the chain here.
    if (!speechSynthesis.speaking)
      S.timer = setTimeout(() => {
        if (!next(true)) stop();
      }, 250);
    return true;
  };
  onRender(() => {
    if (S.voice) speak(L(S.lang, S.steps[S.i]?.m));
  });
  $('voiceBtn').addEventListener('click', () => {
    menuOpen(false);
    if (!supported()) {
      toast(t(S.lang, 'noVoice'));
      return;
    }
    S.voice = !S.voice;
    if (S.voice) render(false);
    else speechSynthesis.cancel();
    refreshToggles();
  });
}
