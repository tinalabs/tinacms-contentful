import { Asset } from "contentful";
import { Upload } from "contentful-management/dist/typings/entities/upload";
import { Media, MediaList, MediaListOptions, MediaStore, MediaUploadOptions } from "tinacms"
import { ContentfulClient } from "../ApiClient";

export interface ContentfulMediaStoreOptions {
  accepts: string
}

export interface ContentfulMedia extends Media {
  file: Asset['fields']['file'];
}

export class ContentfulMediaStore implements MediaStore {
  constructor(private ContentfulClient: ContentfulClient, options: ContentfulMediaStore) {
    this.accept = options.accept || this.accept;
  }

  accept = ".jpg,.JPEG,.png";

  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    const uploaded = files.map(file => {
      return undefined;
    });

    return uploaded;
  }

  async previewSrc(src: string) {
    return src;
  }

  async delete(media: Media) {
    return await this.ContentfulClient.deleteEntry(media.id);
  }

  async list(options?: MediaListOptions): Promise<MediaList> {
    const assets: Asset[] = [];
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;

    return {
      items: assets.map(assetToMedia).slice(offset, offset + limit),
      offset,
      limit,
      nextOffset: nextOffset(offset, limit, assets.length),
      totalCount: assets.length,
    }
  }
}

const nextOffset = (offset: number, limit: number, count: number) => {
  if (offset + limit < count) return offset + limit
  return undefined
}

const assetToMedia = (asset: Asset): ContentfulMedia  => {
  return {
    type: "file",
    id: asset.sys.id,
    filename: asset.fields.file.fileName,
    directory: "",
    file: asset.fields.file
  }
}

const fileToUpload = (file: MediaUploadOptions): Upload => {
  return {
    
  }
}