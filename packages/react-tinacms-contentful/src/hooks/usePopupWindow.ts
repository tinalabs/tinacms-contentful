import { popupWindow } from "tinacms-contentful";

export function usePopupWindow(args: Parameters<typeof popupWindow>): Window {
  const popup = popupWindow(...args);

  return popup;
}

export default usePopupWindow;
