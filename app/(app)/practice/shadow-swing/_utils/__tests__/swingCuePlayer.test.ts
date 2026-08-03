/**
 * ブラウザ API（Web Audio / SpeechSynthesis / navigator.vibrate）は jsdom に無いため、
 * ここでは「どの API をどの順番で呼ぶか」だけを検証する。
 * 実際に音が鳴るか・振動するかは実機でしか確認できない。
 */

import { SwingCuePlayer } from "../swingCuePlayer";

interface MockOscillator {
  type: string;
  frequency: { setValueAtTime: jest.Mock };
  connect: jest.Mock;
  start: jest.Mock;
  stop: jest.Mock;
}

interface MockGain {
  gain: {
    setValueAtTime: jest.Mock;
    exponentialRampToValueAtTime: jest.Mock;
  };
  connect: jest.Mock;
}

function buildOscillator(): MockOscillator {
  return {
    type: "sine",
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  };
}

function buildGain(): MockGain {
  return {
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  };
}

const oscillators: MockOscillator[] = [];
const resume = jest.fn();
const close = jest.fn();

class MockAudioContext {
  state = "suspended";
  currentTime = 0;
  destination = { id: "destination" };

  resume = async () => {
    this.state = "running";
    resume();
  };

  close = async () => {
    close();
  };

  createOscillator = () => {
    const oscillator = buildOscillator();
    oscillators.push(oscillator);
    return oscillator;
  };

  createGain = () => buildGain();
}

const speak = jest.fn();
const cancel = jest.fn();

class MockUtterance {
  lang = "";
  volume = 1;
  constructor(public text: string) {}
}

function installBrowserApis({
  audio = true,
  speech = true,
  vibrate = true,
}: { audio?: boolean; speech?: boolean; vibrate?: boolean } = {}) {
  if (audio) {
    (window as unknown as Record<string, unknown>).AudioContext =
      MockAudioContext;
  }
  if (speech) {
    Object.defineProperty(window, "speechSynthesis", {
      value: { speak, cancel },
      configurable: true,
      writable: true,
    });
    (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance =
      MockUtterance;
  }
  if (vibrate) {
    Object.defineProperty(navigator, "vibrate", {
      value: jest.fn(() => true),
      configurable: true,
      writable: true,
    });
  }
}

function removeBrowserApis() {
  delete (window as unknown as Record<string, unknown>).AudioContext;
  delete (window as unknown as Record<string, unknown>)
    .SpeechSynthesisUtterance;
  Reflect.deleteProperty(window, "speechSynthesis");
  Reflect.deleteProperty(navigator, "vibrate");
}

beforeEach(() => {
  oscillators.length = 0;
  jest.clearAllMocks();
  removeBrowserApis();
});

afterEach(() => {
  removeBrowserApis();
});

describe("unlock", () => {
  it("AudioContext を作って resume する（ユーザー操作起点で音声を解禁する）", async () => {
    installBrowserApis();
    const player = new SwingCuePlayer();

    await player.unlock();

    expect(resume).toHaveBeenCalledTimes(1);
  });

  it("解禁前に笛を鳴らそうとしても何も再生しない", () => {
    installBrowserApis();
    const player = new SwingCuePlayer();

    player.playWhistle();

    expect(oscillators).toHaveLength(0);
  });

  it("解禁後は笛が発振・停止まで組み立てられる", async () => {
    installBrowserApis();
    const player = new SwingCuePlayer();

    await player.unlock();
    player.playWhistle();

    expect(oscillators).toHaveLength(1);
    expect(oscillators[0].start).toHaveBeenCalledTimes(1);
    expect(oscillators[0].stop).toHaveBeenCalledTimes(1);
  });

  it("Web Audio 非対応でも例外を投げない", async () => {
    installBrowserApis({ audio: false });
    const player = new SwingCuePlayer();

    await expect(player.unlock()).resolves.toBeUndefined();
    expect(() => player.playWhistle()).not.toThrow();
  });
});

describe("speakCount", () => {
  it("日本語で本数を読み上げ、前の読み上げを打ち切る", () => {
    installBrowserApis();
    const player = new SwingCuePlayer();

    player.speakCount(12);

    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(1);
    const utterance = speak.mock.calls[0][0] as MockUtterance;
    expect(utterance.text).toBe("12");
    expect(utterance.lang).toBe("ja-JP");
  });

  it("読み上げ非対応の環境でも例外を投げない", () => {
    installBrowserApis({ speech: false });
    const player = new SwingCuePlayer();

    expect(() => player.speakCount(1)).not.toThrow();
    expect(speak).not.toHaveBeenCalled();
  });
});

describe("vibrate", () => {
  it("対応環境では1本ごとに振動させる", () => {
    installBrowserApis();
    const player = new SwingCuePlayer();

    player.vibrateSwing();

    expect(navigator.vibrate).toHaveBeenCalledWith(40);
  });

  it("非対応環境（iOS Safari など）では navigator.vibrate を呼ばない", () => {
    installBrowserApis({ vibrate: false });
    const player = new SwingCuePlayer();

    expect("vibrate" in navigator).toBe(false);
    expect(() => player.vibrateSwing()).not.toThrow();
    expect(() => player.vibrateCompletion()).not.toThrow();
  });
});

describe("dispose", () => {
  it("読み上げを止めて AudioContext を閉じる", async () => {
    installBrowserApis();
    const player = new SwingCuePlayer();
    await player.unlock();

    player.dispose();

    expect(cancel).toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
