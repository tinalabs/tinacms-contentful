import { ContentType, Field as ContentfulField } from 'contentful';
import { AnyField, Field as TinaField } from '@tinacms/forms';

export class ContentfulFormMapper {
  public static createFieldConfigFromContentType(
    contentType: ContentType
  ): TinaField<AnyField>[] {
    return contentType.fields.reduce(
      (tinaFields: TinaField<AnyField>[], field) => {
        switch (field.type) {
          case 'Text':
            tinaFields.push(this.mapTextToField(field));
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
            tinaFields.push(this.handleUnmappedType(field));
        }

        return tinaFields;
      },
      []
    );
  }

  private static mapContentfulFieldToTinaField(
    field: ContentfulField
  ): TinaField<AnyField> {
    return {
      name: field.id,
      label: field.name,
      component: 'text',
    };
  }

  private static mapTextToField(field: ContentfulField): TinaField<AnyField> {
    const baseField = this.mapContentfulFieldToTinaField(field);

    return {
      ...baseField,
      component: 'text',
    };
  }
  
  private static handleUnmappedType(field: ContentfulField) {
    console.warn(
      `react-tinacms-contentful: Mapping for ${field.type} type not yet implemented`
    );

    return this.mapContentfulFieldToTinaField(field);
  }
}
