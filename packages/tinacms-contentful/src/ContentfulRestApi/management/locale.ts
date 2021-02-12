import { ContentType } from "contentful";
import { MetaLinkProps } from "contentful-management/dist/typings/common-types";

/**
 * Takes a delivery/preview field response and a locale, and maps it
 * to a management api field request
 * 
 * @param fields 
 * @param options 
 * @returns fields
 */
export function getLocalizedFields<EntryShape = Record<string, any>>(fields: EntryShape, options: {
  locale: string,
  contentType?: ContentType
  references?: boolean
}) {
  const createReference = (item: any): Record<"sys", MetaLinkProps> => ({
    sys: {
      type: "Link",
      id: item.sys.id,
      linkType: item.sys.type === "Asset" ? item.sys.type : "Entry"
    }
  });

  return Object.keys(fields).reduce((localizedFields: any, key) => {
    const value = (fields as any)[key];
    const hasReferences = Array.isArray(value) &&
      value.findIndex(item => item && item.sys) !== -1
    const isReference = typeof value?.sys !== "undefined";
    const fieldDefinition = options?.contentType?.fields.find(field => field.name === key);
    let shouldLocalize = true;

    if (fieldDefinition && !fieldDefinition.localized) {
      shouldLocalize = false;
    }

    if (!isReference && !hasReferences && shouldLocalize) {
      localizedFields[key] = {
        [options.locale]: value
      }
    }
    else if (hasReferences && options.references && shouldLocalize) {
      localizedFields[key] = {
        [options.locale]: value.map((item: any) => createReference(item))
      }
    }
    else if (isReference && options.references && shouldLocalize) {
      localizedFields[key] = {
        [options.locale]: createReference(value)
      }
    }

    return localizedFields;
  }, {});
}