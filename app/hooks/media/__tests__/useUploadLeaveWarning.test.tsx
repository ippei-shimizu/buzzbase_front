import { renderHook } from "@testing-library/react";
import { useUploadLeaveWarning } from "@app/hooks/media/useUploadLeaveWarning";

function dispatchBeforeUnload(): Event {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe("useUploadLeaveWarning", () => {
  it("アップロード中はページ離脱を引き止める", () => {
    renderHook(() => useUploadLeaveWarning(true));

    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it("アップロードしていない間は引き止めない", () => {
    renderHook(() => useUploadLeaveWarning(false));

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it("アップロードが完了したら引き止めをやめる", () => {
    const { rerender } = renderHook(
      ({ isUploading }) => useUploadLeaveWarning(isUploading),
      { initialProps: { isUploading: true } },
    );
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);

    rerender({ isUploading: false });

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it("アンマウント後は引き止めない", () => {
    const { unmount } = renderHook(() => useUploadLeaveWarning(true));

    unmount();

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });
});
