import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ActionButton, ModalProvider, useModalContainer } from "tinacms";
import { ScreenPluginModal } from "@tinacms/react-screens";
import { MediaFilterScreenPlugin } from "./media-filter-screen";

export function MediaFilterActionButton() {
  const { portalNode } = useModalContainer();
  const [shouldShow, setShouldShow] = useState(false);

  return (
    <>
      <ActionButton onClick={() => setShouldShow(true)}>
        Filter Media
      </ActionButton>
      {portalNode && shouldShow && ReactDOM.createPortal(
        <MediaManagerFilterModal enabled={true} />,
        portalNode
      )}
    </>
  )
}

export interface MediaManagerFilterModalProps {
  enabled: boolean;
}

export function MediaManagerFilterModal(props: MediaManagerFilterModalProps) {
  const [enabled, setEnabled] = useState(props.enabled);

  return (
    <ModalProvider>
      {enabled && (
        <ScreenPluginModal
          screen={MediaFilterScreenPlugin}
          close={() => setEnabled(false)}
        />
      )}
    </ModalProvider>
  )
}

export const MediaFilterAction = {
  type: "global",
  action: MediaFilterActionButton
}