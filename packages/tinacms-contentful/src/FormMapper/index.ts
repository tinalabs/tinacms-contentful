import type { ContentType, Field as ContentfulField } from 'contentful';
import type { Field as TinaField } from 'tinacms';

export function createFieldConfigFromContentType(contentType: ContentType): TinaField<any>[] {
  return contentType.fields.reduce(
    (tinaFields: TinaField<any>[], field) => {
      switch (field.type) {
        case 'Text':
          tinaFields.push(mapTextToField(field));
          break;
        case 'RichText':

        // TODO: markdown handling
        // break;
        case 'Object':
        // TODO: json handling
        // break;
        case 'Number':
        case 'Integer':
        // TODO: number field handling
        // break;
        case 'Date':
        // TODO: date field handling
        // break;
        case 'Boolean':
        // TODO: slider/checkbox handling
        // break;
        case 'Array':
        // TODO: handle select and multiselect
        // break;
        default:
          tinaFields.push(handleUnmappedType(field));
      }

      return tinaFields;
    },
    []
  );
}

function mapContentfulFieldToTinaField(field: ContentfulField): TinaField<any> {
  return {
    name: field.id,
    label: field.name,
    component: 'text',
  };
}

function mapTextToField(field: ContentfulField): TinaField<any> {
  const baseField = mapContentfulFieldToTinaField(field);

  return {
    ...baseField,
    component: 'text',
  };
}
  
function handleUnmappedType(field: ContentfulField) {
  console.warn(
    `react-tinacms-contentful: Mapping for ${field.type} type not yet implemented`
  );

  return mapContentfulFieldToTinaField(field);
}
