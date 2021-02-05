import type { ContentType, Field as ContentfulField } from 'contentful';
import type { Field as TinaField } from 'tinacms';

export function createFieldConfigFromContentType(contentType: ContentType): TinaField<any>[] {
  return contentType.fields.reduce(
    (tinaFields: TinaField<any>[], field) => {
      const tinaField = mapContentfulFieldToTinaField(field);

      if (tinaField) {
        tinaFields.push(tinaField)
      }

      return tinaFields;
    },
    []
  );
}

function mapContentfulFieldToTinaField(field: ContentfulField): TinaField<any> | undefined {
  const tinaField: any = {
    name: `fields.${field.id}`,
    label: field.name,
    component: 'text',
  }

  switch (field.type) {
    case "Text":
      break;
    case "Array":
      tinaField.component = "list"
      tinaField.field = {
        component: "text"
      }
      break;
    case "Boolean":
      tinaField.component = "toggle"
      break;
    case "Integer":
    case "Number":
      tinaField.component = "number"
      break;
    case "Date":
      tinaField.component = "date"
      break;
    case "Link":
      return undefined;
    default:
      console.warn(
        `react-tinacms-contentful: Mapping for ${field.type} type not yet implemented`
      );      
  }

  return tinaField;
}
