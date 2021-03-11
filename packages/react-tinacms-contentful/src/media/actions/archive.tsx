import React from "react";
import { ActionButton } from "tinacms";
import { ContentfulMedia } from "tinacms-contentful"; 
import { useContentful } from "../../hooks";

export interface ArchiveActionProps {
  media: ContentfulMedia | ContentfulMedia[]
}

export function MediaArchiveActionButton(props: ArchiveActionProps) {
  const contentful = useContentful();
  const onClick = () => Array.isArray(props.media)
    ? props.media.forEach(media => contentful.archiveAsset(media.id))
    : contentful.archiveAsset(props.media.id)

  return (
    <ActionButton onClick={onClick}>
      Archive
    </ActionButton>
  )
}

export const MediaArchiveAction = {
  type: "single",
  action: MediaArchiveActionButton
}