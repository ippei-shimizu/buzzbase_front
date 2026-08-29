import {
  supportsScreenWakeLock,
  supportsVibration,
  unsupportedOnServer,
} from "../browserSupport";

function defineOnNavigator(key: string) {
  Object.defineProperty(navigator, key, {
    value: jest.fn(),
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "vibrate");
  Reflect.deleteProperty(navigator, "wakeLock");
});

describe("supportsVibration", () => {
  it("navigator に vibrate が無い環境（iOS Safari など）では false", () => {
    expect("vibrate" in navigator).toBe(false);
    expect(supportsVibration()).toBe(false);
  });

  it("navigator が vibrate を持つ環境では true", () => {
    defineOnNavigator("vibrate");
    expect(supportsVibration()).toBe(true);
  });
});

describe("supportsScreenWakeLock", () => {
  it("navigator に wakeLock が無い環境では false", () => {
    expect(supportsScreenWakeLock()).toBe(false);
  });

  it("navigator が wakeLock を持つ環境では true", () => {
    defineOnNavigator("wakeLock");
    expect(supportsScreenWakeLock()).toBe(true);
  });
});

describe("unsupportedOnServer", () => {
  it("SSR 時は常に非対応として描画する", () => {
    expect(unsupportedOnServer()).toBe(false);
  });
});
