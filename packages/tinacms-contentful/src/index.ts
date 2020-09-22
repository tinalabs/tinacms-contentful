import { ContentfulSSR } from "./services/contentful/ssr";

export type { getContentfulEntryOptions, getContentfulEntriesOptions } from './services/contentful/ssr';
export const getContentfulEntry = ContentfulSSR.getContenfulEntry;
export const getContentfulEntries = ContentfulSSR.getContentfulEntries;

export * from "./declarations";
export * from "./events";
export * from "./apis/contentful";
export * from "./services/contentful/apis";
export * from "./services/contentful/authentication";
export * from "./services/contentful/delivery";
export * from "./services/contentful/formMapper";
export * from "./services/contentful/management";
export * from "./services/contentful/ssr";
export * from "./utils/popup";