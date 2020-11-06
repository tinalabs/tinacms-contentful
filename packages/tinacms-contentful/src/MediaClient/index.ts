import { Asset } from "contentful";
import { AssetFileProp } from "contentful-management/dist/typings/entities/asset";
import { Media, MediaStore, MediaUploadOptions, MediaList, MediaListOptions } from "tinacms";
import { ContentfulClient } from "../ApiClient";

export interface ContentfulMediaStoreOptions {
  accepts?: string
}

export interface ContentfulMedia extends Media {
  sys: Asset['sys'];
  fields: Asset['fields'];
}

export class ContentfulMediaStore implements MediaStore {
  constructor(private ContentfulClient: ContentfulClient, options: ContentfulMediaStoreOptions) {
    this.accept = options.accepts || this.accept;
  }

  accept = ".jpg,.JPEG,.png";

  async persist(files: MediaUploadOptions[]): Promise<ContentfulMedia[]> {
    const upload_actions = files
      .map(async (file) => await mediaUploadToContentfulUpload(file))
      .map(async (file) => this.ContentfulClient.createAsset(await file));
    const mgmt_assets = await Promise.all(upload_actions);
    const assets = await Promise.all(mgmt_assets.map(async(asset) => await this.ContentfulClient.getAsset(asset.sys.id)));

    return assets.map((asset, index) => assetToMedia(asset));
  }

  async previewSrc(src: string) {
    return src;
  }

  async delete(media: ContentfulMedia) {
    return await this.ContentfulClient.deleteAsset(media.sys.id);
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

const mediaUploadToContentfulUpload = async (file: MediaUploadOptions): Promise<Pick<AssetFileProp, "fields">> => {
  return {
    fields: {
      title: {
        ["en"]: file.file.name
      },
      description: {
        ["en"]: file.directory
      },
      file: {
        ["en"]: {
          file: await file.file.text(),
          contentType: "Untitled",
          fileName: file.file.name
        } 
      }
    }
  }
}

const assetToMedia = (asset: Asset): ContentfulMedia  => {
  return {
    type: "file",
    id: asset.sys.id,
    previewSrc: asset.fields.file.url,
    filename: asset.fields.file.fileName,
    directory: "",
    sys: asset.sys,
    fields: asset.fields,
  }
}