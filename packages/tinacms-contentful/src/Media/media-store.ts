import { Asset } from "contentful";
import { AssetFileProp } from "contentful-management/dist/typings/entities/asset";
import { Media, MediaStore, MediaUploadOptions, MediaList, MediaListOptions } from "tinacms";
import { ContentfulClient } from "../ApiClient";
import directories, { fileTypes } from "./directories";

export interface ContentfulMediaStoreOptions {
  actions?: any[];
  accepts?: string
  pagination?: number;
}

export interface ContentfulMedia extends Media {
  sys?: Asset['sys'];
  fields?: Asset['fields'];
}

export interface ContentfulDirectory {
  name: string;
  directories: ContentfulDirectory[];
  files: string[]
}

export class ContentfulMediaStore implements MediaStore {
  constructor(private ContentfulClient: ContentfulClient, private options: ContentfulMediaStoreOptions) {
    this.accept = options.accepts || this.accept;
    this.actions = options.actions || this.actions;
  }

  accept = "*";
  actions: any[] = [];
  private filter: any = {};

  setFilter(query: any) {
    if (typeof query === "object") {
      this.filter = query;
    }
  }

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
    if (media?.sys?.id) {
      return await this.ContentfulClient.deleteAsset(media?.sys?.id);
    }
  }

  async list(options?: MediaListOptions): Promise<MediaList> {
    if (options?.directory) {
      return await this.handleAssetPagination(options);
    }

    return await this.handleBaseDirectoryListing(options);
  }

  private async handleAssetPagination(options?: MediaListOptions) {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? this.options.pagination ?? 25;
    const query = createAssetQuery(options);
    const current_collection = await this.ContentfulClient.getAssetCollection({
      ...query,
      limit: limit,
      skip: offset
    });
    let items: Media[] = current_collection.items
      .map((asset) => assetToMedia(asset, options?.directory));
    
    return {
      items: items,
      offset: current_collection.skip,
      limit: current_collection.limit,
      nextOffset: nextOffset(offset, limit, current_collection.total),
      totalCount: current_collection.total
    }
  }

  private async handleBaseDirectoryListing(options?: MediaListOptions) {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? this.options.pagination ?? 25;
    const items = directories;

    return {
      items: items,
      offset,
      limit,
      nextOffset: nextOffset(offset, limit, items.length),
      totalCount: items.length
    }
  }
}

const nextOffset = (offset: number, limit: number, total: number) => {
  if (offset + limit <= total)
    return offset + limit;
  
  return 
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

const assetToMedia = (asset: Asset, directory?: string): ContentfulMedia => {
  return {
    type: "file",
    id: asset.sys.id,
    previewSrc: asset.fields.file.url,
    filename: asset.fields.file.fileName,
    directory: directory ?? "",
    sys: asset.sys,
    fields: asset.fields,
  }
}

const createAssetQuery = (values: any) => {
  const possible_types = Object.keys(fileTypes);
  let query: any = {};

  if (!values.directory || values.directory.indexOf(possible_types)) {
    const dir = directories.find(dir => dir.filename === values.directory);

    if (dir && fileTypes[dir.id]) {
      query["mimetype_group"] = fileTypes[dir.id].mime_type_group;
    }
  }

  return query;
}