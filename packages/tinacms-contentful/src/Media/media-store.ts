import { Asset } from "contentful";
import { Media, MediaList, MediaListOptions, MediaStore, MediaUploadOptions } from "tinacms";
import { ContentfulClient } from "../ApiClient";
import directories, { fileTypes } from "./directories";

export interface ContentfulMediaStoreOptions {
  actions?: any[];
  accepts?: string
  pagination?: number;
  locale?: string;
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
    this.locale = this.options.locale ?? "en";
  }

  accept = "*";
  actions: any[] = [];
  locale: string;
  private filter: any = {};

  /**
   * Set the filter to run on media
   * 
   * @param query 
   */
  setFilter(query: any) {
    if (typeof query === "object") {
      this.filter = query;
    }
  }

  /**
   * Write media store files back to Contenful as Assets
   * 
   * @param files Array of media files to write back
   * @returns Array of newly created media files
   */
  async persist(files: MediaUploadOptions[]): Promise<ContentfulMedia[]> {
    const upload_actions = files
      .map(async (file) => await mediaUploadToContentfulUpload(file))
      .map(async (file) => {
        const upload = await file;

        return this.ContentfulClient.createAsset(upload, { locale: this.locale })
      });
    const mgmt_assets = await Promise.all(upload_actions);
    const assets = await Promise.all(mgmt_assets.map(async(asset) => await this.ContentfulClient.getAsset(asset.sys.id)));

    return assets.map((asset, index) => assetToMedia(asset));
  }

  /**
   * Returns the URL to the media files
   * 
   * @param src 
   * @returns Path to media file
   */
  async previewSrc(src: string) {
    return src;
  }

  /**
   * Deletes a media file from Contentful by deleting the related Asset
   * 
   * @param media The media file to delete
   */
  async delete(media: ContentfulMedia) {
    try {
      if (media?.sys?.id) {
        await this.ContentfulClient.deleteAsset(media?.sys?.id);
      }
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Returns a list of media types to fetch, or the media corresponding to a selected type
   * 
   * @param optionss Current Media List Options
   * @returns A media list to display
   */
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
    }, {
      preview: true
    });
    let items: Media[] = current_collection.items.filter((asset) => asset.fields.file)
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

export type ContentfulUpload = {
  fields: {
      title: string;
      description: string;
      file: {
        file: string | ArrayBuffer | any;
        contentType: string;
        fileName: string;
      };
  };
}

/**
 * Converts the media store upload options to a Contentful Upload object
 * @param upload Media store upload
 * @returns Contentful upload
 */
const mediaUploadToContentfulUpload = async (upload: MediaUploadOptions): Promise<ContentfulUpload> => {
  return {
    fields: {
      title: upload.file.name,
      description: upload.directory,
      file: {
        file: await upload.file.arrayBuffer(),
        contentType: upload.file.type ?? "Untitled",
        fileName: upload.file.name
      }
    }
  }
}

/**
 * Converts a Contentful Asset to a Media Store Item
 * 
 * @param asset The Contentful Asset to convert
 * @param directory The "directory" or media type for the media asset to be displayed in (Optional)
 * @returns 
 */
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

/**
 * Creates an asset query from a media listing
 * 
 * @param values Media list options
 * @returns A contentful asset query
 */
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