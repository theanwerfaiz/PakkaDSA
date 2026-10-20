// @vitest-environment happy-dom
// @vitest-environment-options {"settings":{"disableJavaScriptFileLoading":true,"disableJavaScriptEvaluation":true,"disableCSSFileLoading":true,"navigator":{"userAgent":"vitest"}}}
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { $, key, openAlgo, openHome, openTrack, text, until } from './harness';

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe('viewer', () => {
  it('starts on the build-time drawing and steps, jumps and scrubs', async () => {
    await openAlgo('bubble');
    expect(document.querySelectorAll('#stage svg')).toHaveLength(1);
    expect($('stage').querySelector('svg')?.getAttribute('data-sig')).toMatch(/^bubble\|bars\|/);
    expect(text('stepLbl')).toBe('Step 1 of 58');
    $('bNext').click();
    expect(text('stepLbl')).toBe('Step 2 of 58');
    expect(text('note')).toBe('Compare 38 and 27.');
    expect($('note').innerHTML).toContain('<mark>38</mark>');
    expect(text('watch')).toContain('Comparisons1');
    key('ArrowRight');
    key('ArrowLeft');
    expect(text('stepLbl')).toBe('Step 2 of 58');
    $('bEnd').click();
    expect(text('stepLbl')).toBe('Step 58 of 58');
    key('Home');
    expect(text('stepLbl')).toBe('Step 1 of 58');
    key('End');
    $('bStart').click();
    $('bPrev').click();
    expect(text('stepLbl')).toBe('Step 1 of 58');
    const scrub = $<HTMLInputElement>('scrub');
    scrub.value = '10';
    scrub.dispatchEvent(new Event('input'));
    expect(text('stepLbl')).toBe('Step 11 of 58');
    expect($('code').querySelectorAll('div.on').length).toBeGreaterThan(0);
  });

  it('plays at the chosen speed and stops at the end', async () => {
    await openAlgo('linear');
    vi.useFakeTimers();
    const speed = $<HTMLInputElement>('speed');
    speed.value = '6';
    speed.dispatchEvent(new Event('input'));
    expect(text('speedLbl')).toBe('4×');
    $('bPlay').click();
    expect($('bPlay').getAttribute('aria-label')).toBe('Pause');
    vi.advanceTimersByTime(5000);
    expect(text('stepLbl')).toBe('Step 7 of 7');
    expect($('bPlay').getAttribute('aria-label')).toBe('Play');
    key(' ');
    expect(text('stepLbl')).toBe('Step 1 of 7'); // play from the end restarts
    key(' ');
    expect(localStorage.getItem('pakkadsa:speed')).toBe('6');
  });

  it('marks as learned, shows progress, and remembers the last position', async () => {
    await openAlgo('quick');
    $('learnBtn').click();
    expect($('learnBtn').getAttribute('aria-pressed')).toBe('true');
    expect(text('progTxt')).toBe('1 / 38 learned');
    expect(JSON.parse(localStorage.getItem('pakkadsa:learned') ?? '[]')).toEqual(['quick']);
    $('learnBtn').click();
    expect(text('progTxt')).toBe('0 / 38 learned');
    expect($('nextAlgo').dataset.go).toBe('/algorithms/heap-sort/');
    vi.useFakeTimers();
    $('bNext').click();
    vi.advanceTimersByTime(600);
    expect(JSON.parse(localStorage.getItem('pakkadsa:last') ?? 'null')).toEqual({
      id: 'quick',
      i: 1,
    });
  });

  it('switches tabs with clicks and arrow keys', async () => {
    await openAlgo('merge');
    $('tAbout').click();
    expect($('pAbout').hidden).toBe(false);
    key('ArrowLeft', $('tAbout'));
    expect($('pInput').hidden).toBe(false);
    key('ArrowRight', $('tInput'));
    expect($('tAbout').getAttribute('aria-selected')).toBe('true');
  });

  it('opens a shared link at its step and input, and follows hash changes', async () => {
    const d = encodeURIComponent(JSON.stringify({ type: 'arr', a: [3, 1, 2] }));
    await openAlgo('bubble', 'en', `#s=2&d=${d}`);
    expect(text('stepLbl')).toMatch(/^Step 3 of \d+$/);
    $('shareBtn').click();
    await until(() => !!$<HTMLInputElement>('shareInp').value);
    expect($<HTMLInputElement>('shareInp').value).toContain('#s=2&d=');
    location.hash = '#s=0';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await until(() => text('stepLbl').startsWith('Step 1 of'));
  });

  it('ignores a broken link', async () => {
    await openAlgo('bubble', 'en', '#s=x&d=%7Bbroken');
    expect(text('stepLbl')).toBe('Step 1 of 58');
  });

  it('runs in Hindi', async () => {
    await openAlgo('parens', 'hi');
    $('bNext').click();
    expect(text('stepLbl')).toBe('कदम 2 में से 14');
    expect($('stage').querySelector('svg')?.getAttribute('aria-label')).toBe(
      'Valid parentheses, कदम 2 (14 में से)',
    );
  });

  it('redraws at the narrow width when the stage is small', async () => {
    await openAlgo('hanoi');
    Object.defineProperty($('stage'), 'clientWidth', { configurable: true, value: 400 });
    $('bNext').click();
    expect($('stage').querySelector('svg')?.getAttribute('viewBox')).toMatch(/^0 0 420 /);
    window.dispatchEvent(new Event('resize'));
  });
});

describe('header and menu', () => {
  it('opens with arrow keys, toggles settings, and closes with Escape', async () => {
    await openAlgo('bubble');
    $('moreBtn').click();
    expect($('moreMenu').hidden).toBe(false);
    key('ArrowDown', $('voiceBtn'));
    key('ArrowUp', $('classBtn'));
    key('End', $('voiceBtn'));
    key('Home', $('saveBtn'));
    key('Escape', $('voiceBtn'));
    expect($('moreMenu').hidden).toBe(true);
    $('moreBtn').click();
    key('Tab', $('voiceBtn'));
    expect($('moreMenu').hidden).toBe(true);
    $('moreBtn').click();
    document.body.click();
    expect($('moreMenu').hidden).toBe(true);
    $('moreBtn').click();
    key('Escape');
    expect($('moreMenu').hidden).toBe(true);

    $('themeBtn').click();
    expect(localStorage.getItem('pakkadsa:theme')).toBe('"dark"');
    $('animBtn').click();
    expect(document.documentElement.classList.contains('noanim')).toBe(true);
    expect(localStorage.getItem('pakkadsa:anim')).toBe('false');
    $('classBtn').click();
    expect(document.body.classList.contains('classroom')).toBe(true);
    key('c');
    expect(document.body.classList.contains('classroom')).toBe(false);
  });

  it('narrates each step and paces playback by speech', async () => {
    const spoken: string[] = [];
    class Utter {
      lang = '';
      rate = 1;
      voice: unknown = null;
      onend: (() => void) | null = null;
      constructor(public text: string) {}
    }
    vi.stubGlobal('SpeechSynthesisUtterance', Utter);
    vi.stubGlobal('speechSynthesis', {
      speaking: false,
      cancel() {},
      getVoices: () => [{ lang: 'en-IN' }],
      speak(u: Utter) {
        spoken.push(u.text);
        setTimeout(() => u.onend?.(), 10);
      },
    });
    await openAlgo('linear');
    $('voiceBtn').click();
    expect(spoken).toHaveLength(1);
    $('bPlay').click();
    await until(() => spoken.length > 3);
    $('bPlay').click();
    $('voiceBtn').click();
    vi.unstubAllGlobals();
  });

  it('explains when narration is unavailable', async () => {
    vi.stubGlobal('speechSynthesis', undefined);
    await openAlgo('linear');
    $('voiceBtn').click();
    expect(text('toast')).toBe('Narration is not supported in this browser.');
    vi.unstubAllGlobals();
  });

  it('keeps the hash when switching language', async () => {
    await openAlgo('bubble', 'en', '#s=3');
    const assign = vi.fn();
    const e = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...location,
        hash: '#s=3',
        set href(v: string) {
          assign(v);
        },
      },
    });
    $('langBtn').dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    delete (window as unknown as { location?: unknown }).location; // back to the real location
  });
});

describe('sidebar', () => {
  it('filters by name or category in either language', async () => {
    await openAlgo('bubble', 'hi');
    const search = $<HTMLInputElement>('search');
    const visible = () =>
      [...document.querySelectorAll<HTMLElement>('#nav .al')].filter((a) => !a.hidden).length;
    search.value = 'ट्री';
    search.dispatchEvent(new Event('input'));
    expect(visible()).toBe(6);
    search.value = 'sort';
    search.dispatchEvent(new Event('input'));
    expect(visible()).toBe(7);
    search.value = 'zzz';
    search.dispatchEvent(new Event('input'));
    expect($('noMatch').hidden).toBe(false);
    $('menuBtn').click();
    expect($('side').classList.contains('open')).toBe(true);
    key('Escape');
    expect($('side').classList.contains('open')).toBe(false);
    $('menuBtn').click();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect($('side').classList.contains('open')).toBe(false);
  });
});

describe('quiz', () => {
  it('asks before the outcome, scores, explains and continues', async () => {
    await openAlgo('bubble');
    key('q');
    expect(text('score')).toBe('Quiz 0/0');
    $('bNext').click();
    $('bNext').click();
    expect($('quiz').classList.contains('open')).toBe(true);
    expect(text('quizQ')).toBe('Will 38 and 27 swap?');
    key('Escape', $('quiz')); // not answered: stays open
    key('Tab', $('quiz'));
    expect($('quiz').classList.contains('open')).toBe(true);
    ($('quizOpts').querySelectorAll('button')[1] as HTMLButtonElement).click();
    expect(text('quizFb')).toBe('Not quite. Answer: Yes');
    key('Escape', $('quiz'));
    expect($('quiz').classList.contains('open')).toBe(false);
    expect(text('score')).toBe('Quiz 0/1');
    expect(text('stepLbl')).toBe('Step 3 of 58');
  });

  it('pauses auto-play for a question and resumes after it', async () => {
    await openAlgo('linear');
    vi.useFakeTimers();
    $('quizBtn').click();
    $('bPlay').click();
    vi.advanceTimersByTime(2000); // two steps at 1×: the question is on step 2
    expect($('quiz').classList.contains('open')).toBe(true);
    ($('quizOpts').querySelector('button') as HTMLButtonElement).click();
    $('quizGo').click();
    expect($('bPlay').getAttribute('aria-label')).toBe('Pause');
  });
});

describe('code panel', () => {
  it('switches language, remembers it, and copies without tags', async () => {
    await openAlgo('bubble');
    ($('langSeg').querySelector('[data-cl="py"]') as HTMLButtonElement).click();
    await until(() => text('code').includes('def bubble_sort'));
    expect(localStorage.getItem('pakkadsa:codeLang')).toBe('"py"');
    const writeText = vi.fn().mockRejectedValue(new Error('blocked'));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    document.execCommand = vi.fn(() => true);
    $('copyCode').click();
    await until(() => text('toast') === 'Code copied');
    ($('langSeg').querySelector('[data-cl="java"]') as HTMLButtonElement).click();
    ($('langSeg').querySelector('[data-cl="pseudo"]') as HTMLButtonElement).click();
    await until(() => $('code').classList.contains('pseudo'));
  });
});

describe('input panel', () => {
  it('validates, runs, randomises and resets', async () => {
    await openAlgo('kadane');
    const a = $<HTMLInputElement>('in-a');
    a.value = '1, x';
    $('inApply').click();
    expect(text('inErr')).toBe('Use whole numbers separated by commas, like 5, 3, 8.');
    a.dispatchEvent(new Event('input', { bubbles: true }));
    expect(text('inErr')).toBe('');
    a.value = '-1, -2, 3';
    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await until(() => text('toast') === 'Running with your input');
    $('inRand').click();
    await until(() => $<HTMLInputElement>('in-a').value !== '-1, -2, 3');
    $('inReset').click();
    await until(() => $<HTMLInputElement>('in-a').value === '-2, 1, -3, 4, -1, 2, 1, -5, 4');
  });

  it('runs a picked start node', async () => {
    await openAlgo('dfs');
    const sel = $<HTMLSelectElement>('in-s');
    sel.value = 'E';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    await until(() => text('note').includes('DFS from E'));
  });

  it('edits the grid: modes, maze and clear', async () => {
    await openAlgo('gridbfs');
    const walls = () => document.querySelectorAll('#stage svg rect[fill="var(--wall)"]').length;
    ($('pInput').querySelector('[data-gm="start"]') as HTMLButtonElement).click();
    expect($('pInput').querySelector('[data-gm="start"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    ($('pInput').querySelector('[data-gm="wall"]') as HTMLButtonElement).click();
    $('gClear').click();
    await until(() => walls() === 0);
    $('gMaze').click();
    await until(() => walls() > 20);
    const stage = $('stage');
    stage.dispatchEvent(new PointerEvent('pointerdown', { clientX: 5, clientY: 5, bubbles: true }));
    stage.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 6, clientY: 6, buttons: 1, bubbles: true }),
    );
    stage.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
});

describe('other pages', () => {
  it('home: continue button, learned ticks and the hero', async () => {
    await openHome(); // a fresh page first, so no earlier page's timers can write to storage
    localStorage.clear();
    localStorage.setItem('pakkadsa:last', JSON.stringify({ id: 'binary', i: 3 }));
    localStorage.setItem('pakkadsa:learned', JSON.stringify(['bubble', 'linear']));
    await openHome();
    expect($('hCont').hidden).toBe(false);
    expect(text('hCont')).toBe('Continue: Binary search, step 4');
    expect($<HTMLAnchorElement>('hCont').getAttribute('href')).toBe(
      '/algorithms/binary-search/#s=3',
    );
    expect(document.querySelector('[data-track="basics"] .count')?.textContent).toBe(
      '2 / 5 learned',
    );
    await until(() => !!document.querySelector('#heroStage svg[data-sig]'));
  });

  it('track page: progress', async () => {
    localStorage.setItem('pakkadsa:learned', JSON.stringify(['dijkstra']));
    await openTrack('graphs');
    expect(document.querySelector('.track .count')?.textContent).toBe('1 / 6 learned');
  });

  it('offers installation once', async () => {
    await openHome();
    const evt = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: vi.fn().mockResolvedValue(undefined),
    });
    window.dispatchEvent(evt);
    const bar = document.querySelector('.install') as HTMLElement;
    expect(bar.textContent).toContain('Install PakkaDSA');
    (bar.querySelectorAll('button')[0] as HTMLButtonElement).click();
    expect(evt.prompt).toHaveBeenCalled();
    expect(localStorage.getItem('pakkadsa:install')).toBe('true');
    window.dispatchEvent(new Event('beforeinstallprompt'));
    expect(document.querySelector('.install')).toBeNull();
  });

  it('works with storage blocked', async () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const spy2 = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    await openAlgo('fib');
    $('learnBtn').click();
    expect($('learnBtn').getAttribute('aria-pressed')).toBe('true');
    spy.mockRestore();
    spy2.mockRestore();
  });
});
