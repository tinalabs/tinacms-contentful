import React from "react";
import { ScreenPlugin, useFormScreenPlugin } from "tinacms";
import { MediaFilterFormView, useMediaFilterForm } from "./media-filter-form";

export function MediaFilter() {
  return (
    <MediaFilterFormView />
  )
}

export const MediaFilterScreenPlugin: ScreenPlugin = {
  __type: "screen",
  name: "Filter Media",
  layout: "fullscreen",
  Icon: () => null,
  Component: MediaFilter
}

export const useMediaFilterScreenPlugin = () => {
  const [, form] = useMediaFilterForm()

  return useFormScreenPlugin(form);
}