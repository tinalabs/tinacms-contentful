import { Media } from "tinacms";

export interface FileTypes {
  [key: string]: FileType
}

export interface FileType {
  mime_type_group: string;
  single: string;
  plural: string;
}

export const fileTypes: FileTypes = {
  attachment: {
    mime_type_group: "attachment",
    single: "Attachment",
    plural: "Attachments"
  },
  plaintext: {
    mime_type_group: "plaintext",
    single: "Plain Text Media",
    plural: "Plain Text Media"
  },
  image: {
    mime_type_group: "image",
    single: "Image",
    plural: "Images"
  },
  audio: {
    mime_type_group: "audio",
    single: "Audio",
    plural: "Audio"
  },
  video: {
    mime_type_group: "video",
    single: "Video",
    plural: "Videos"
  },
  richtext: {
    mime_type_group: "richtext",
    single: "Rich Text Document",
    plural: "Rich Text Documents"
  },
  presentation: {
    mime_type_group: "presentation",
    single: "Presentation",
    plural: "Presentations"
  },
  spreadsheet: {
    mime_type_group: "spreadsheet",
    single: "Spreadsheet",
    plural: "Spreadsheets"
  },
  pdfdocument: {
    mime_type_group: "pdfdocument",
    single: "PDF Document",
    plural: "PDF Documents"
  },
  archive: {
    mime_type_group: "archive",
    single: "Archive",
    plural: "Archives"
  },
  code: {
    mime_type_group: "code",
    single: "Code",
    plural: "Code" 
  },
  markup: {
    mime_type_group: "markup",
    single: "Markup",
    plural: "Markup"
  }
}

export const baseDirectories: Media[] = [
  {
    type: "dir",
    id: 'all',
    filename: "All Media",
    directory: ""
  },
  ...Object.keys(fileTypes).map(key => {
    const fileType: any = fileTypes[key];

    return {
      type: "dir",
      id: key,
      filename: `All ${fileType.plural}`,
      directory: ""
    } as Media
  })
]

export default baseDirectories;