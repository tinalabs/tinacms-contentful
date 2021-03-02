import { ContentType } from "contentful";
import { MetaLinkProps } from "contentful-management/dist/typings/common-types";

const checkForReferences = (value: any) => Array.isArray(value) &&
  value.findIndex(item => checkForReference(item)) > -1
const checkForReference = (value: any) => typeof value === "object" && typeof value?.sys !== "undefined";

/**
 * Takes a delivery/preview field response, and pulls out nested entries
 * as reference objects
 * 
 * @param fields 
 * @param options 
 * @returns fields
 */
export function getFieldsWithReferences<FieldsShape extends Record<string, any>>(fields: FieldsShape, contentType?: ContentType) {
  const createReference = (item: any): Record<"sys", MetaLinkProps> => {
    if (item.sys.linkType) return item;

    return {
      sys: {
        type: "Link",
        id: item.sys.id,
        linkType: item.sys.type === "Asset" ? "Asset" : "Entry"
      }
    }
  };

  return Object.keys(fields)
    .reduce((references: Record<string, any>, fieldName) => {
      const field = fields[fieldName] as any;
      const fieldDefinition = contentType?.fields.find(def => def.id === fieldName);
      const isReference = fieldDefinition?.type === "Link" || checkForReference(field);
      const isReferences = isReference && Array.isArray(field) || checkForReferences(field);
      
      if (isReferences) {
        references[fieldName] = field.map((item: any) => createReference(item))
      }
      else if (isReference) {
        references[fieldName] = createReference(field);
      }
      else {
        references[fieldName] = field;
      }

      return references;
    }, {});
}

/**
 * Takes a delivery/preview field response and a locale, and maps it
 * to a management api field request
 * 
 * @param fields 
 * @param options.locale The locale to localize fields into
 * @param options.contentType The content type record to use to find references (optional). If omitted, sys.type and sys.contentType is used.
 * @param options.references Whether or not to reformat references in the returned field object
 */
export function getLocalizedFields<EntryShape = Record<string, any>>(fields: EntryShape, options: {
  locale: string,
  contentType?: ContentType
  references?: boolean
}) {
  const fieldsToLocalize = getFieldsWithReferences(fields);

  return Object.keys(fieldsToLocalize)
    .reduce((localizedFields: any, fieldName) => {
      const fields = fieldsToLocalize;
      const field = (fields as any)[fieldName];
      const fieldDefinition = options?.contentType?.fields.find(field => field.name === fieldName);
      const isReference = Array.isArray(field) ? checkForReferences(field) : checkForReference(field);
      let shouldLocalize = true;
      
      if (fieldDefinition && !fieldDefinition.localized) {
        shouldLocalize = false;
      }
  
      if (shouldLocalize && !isReference && !field[options.locale]) {
        localizedFields[fieldName] = {
          [options.locale]: field
        }
      }
      else if (isReference && options.references) {
        localizedFields[fieldName] = {
          [options.locale]: field
        }
      }
      else if (field[options.locale]) {
        localizedFields[fieldName] = field;
      }
    return localizedFields;
  }, {});
}