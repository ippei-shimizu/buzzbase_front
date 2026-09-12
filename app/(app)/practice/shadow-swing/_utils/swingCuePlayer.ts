import { supportsVibration } from "./browserSupport";

/**
 * 素振り 1 本ごとの合図（笛の音・カウント読み上げ・バイブレーション）をまとめて扱う。
 *
 * ブラウザは自動再生を禁止しており、ユーザー操作のハンドラの中で AudioContext を作って
 * `resume()` しない限り音が鳴らない。そのため `unlock()` を「開始」「再開」ボタンの
 * クリックハンドラから呼ぶ前提の API にしている（未解禁の状態で再生要求が来ても無視する）。
 *
 * 笛は音源ファイルを持たずオシレータで合成する。数十 KB の音声を読み込む必要がなく、
 * 1 本ごとに即時発音できる（ファイル読み込みの遅延がテンポを崩さない）。
 */

type AudioContextConstructor = new () => AudioContext;

const WHISTLE_FREQUENCY_HZ = 2200;
const WHISTLE_DURATION_SECONDS = 0.15;
const WHISTLE_PEAK_GAIN = 0.22;
/** 1 本ごとの短い振動。長いと次のインターバルにかぶる。 */
const VIBRATION_DURATION_MS = 40;
/** 完了時の達成演出。振動 → 間 → 少し長い振動の 2 拍。 */
const COMPLETION_VIBRATION_PATTERN = [0, 80, 60, 140];

function resolveAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  // Safari は非標準の webkitAudioContext しか持たないバージョンがあるため両方を見る。
  const scope = window as Window & {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  return scope.AudioContext ?? scope.webkitAudioContext ?? null;
}

function resolveSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return "speechSynthesis" in window ? window.speechSynthesis : null;
}

export class SwingCuePlayer {
  private context: AudioContext | null = null;

  /**
   * 音声再生を解禁する。必ずユーザー操作（開始・再開ボタン）のハンドラから呼ぶ。
   * AudioContext は作った直後 `suspended` で、`resume()` を通してからでないと発音しない。
   */
  async unlock(): Promise<void> {
    const AudioContextCtor = resolveAudioContextConstructor();
    if (AudioContextCtor && !this.context) {
      try {
        this.context = new AudioContextCtor();
      } catch {
        this.context = null;
      }
    }

    if (this.context && this.context.state !== "running") {
      try {
        await this.context.resume();
      } catch {
        // 解禁に失敗しても素振り自体は続けられるため、握りつぶして無音で進める。
      }
    }

    this.primeSpeech();
  }

  /**
   * SpeechSynthesis もユーザー操作起点でしか話し始めない実装があるため、
   * 解禁時に空の発話を一度通してキューを起こしておく。
   */
  private primeSpeech(): void {
    const synthesis = resolveSpeechSynthesis();
    if (!synthesis) return;
    try {
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("");
      utterance.volume = 0;
      utterance.lang = "ja-JP";
      synthesis.speak(utterance);
    } catch {
      // 読み上げ非対応でもカウント自体は継続する。
    }
  }

  /** 笛を 1 回鳴らす。未解禁（`unlock()` 前）なら何もしない。 */
  playWhistle(): void {
    const context = this.context;
    if (!context || context.state !== "running") return;

    try {
      const startAt = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      // 矩形波は倍音が多く、屋外でも抜ける笛らしい音になる。
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(WHISTLE_FREQUENCY_HZ, startAt);

      // 立ち上がり・減衰を付けないとプツッというクリックノイズが乗る。
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(WHISTLE_PEAK_GAIN, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + WHISTLE_DURATION_SECONDS,
      );

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + WHISTLE_DURATION_SECONDS);
    } catch {
      // 音が出せなくてもカウントは止めない。
    }
  }

  /** 本数を日本語で読み上げる。前の読み上げが残っていれば打ち切って最新の本数を優先する。 */
  speakCount(count: number): void {
    const synthesis = resolveSpeechSynthesis();
    if (!synthesis) return;

    try {
      synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(count));
      utterance.lang = "ja-JP";
      synthesis.speak(utterance);
    } catch {
      // 読み上げに失敗してもカウントは止めない。
    }
  }

  /** 読み上げを打ち切る。一時停止・終了時に呼ぶ。 */
  stopSpeaking(): void {
    const synthesis = resolveSpeechSynthesis();
    if (!synthesis) return;
    try {
      synthesis.cancel();
    } catch {
      // 何もしない。
    }
  }

  /** 1 本ぶんの振動。非対応ブラウザでは何もしない。 */
  vibrateSwing(): void {
    this.vibrate(VIBRATION_DURATION_MS);
  }

  /** 完了時の達成演出としての振動。 */
  vibrateCompletion(): void {
    this.vibrate(COMPLETION_VIBRATION_PATTERN);
  }

  private vibrate(pattern: number | number[]): void {
    if (!supportsVibration()) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // 非対応・拒否時は無視する。
    }
  }

  /** 画面を離れるときに音声リソースを解放する。 */
  dispose(): void {
    this.stopSpeaking();
    const context = this.context;
    this.context = null;
    if (!context) return;
    try {
      void context.close();
    } catch {
      // すでに閉じている場合は無視する。
    }
  }
}
