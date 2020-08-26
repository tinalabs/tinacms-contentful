import { ContentType, Field as ContentfulField } from 'contentful';
import { AnyField, Field as TinaField } from '@tinacms/forms';

export class ContentfulFormMapper {
  public static createFieldConfigFromContentType(contentType: ContentType): TinaField<AnyField>[] {
    console.log(contentType);

    return contentType.fields.reduce((tinaFields: TinaField<AnyField>[], field) => {
      switch (field.type) {
        case "Text":
          tinaFields.push(this.mapTextToField(field));
          break;
        case "RichText":
          // TODO: markdown handling
          // break;
        case "Object":
          // TODO: json handling
          // break;
        case "Number":
        case "Integer":
          // TODO: number field handling
          // break;
        case "Date":
          // TODO: date field handling
          // break;
        case "Boolean":
          // TODO: slider/checkbox handling
          // break;
        case "Array":
          // TODO: handle select and multiselect
          // break;
        default:
          tinaFields.push(this.handleUnmappedType(field));
      }

      return tinaFields;
    }, []);
  }

  private static mapContentfulFieldToTinaField(field: ContentfulField): TinaField<AnyField> {
    return {
      name: field.id,
      label: field.name,
      component: "text"
    }
  }

  private static mapTextToField(field: ContentfulField): TinaField<AnyField> {
    const baseField = this.mapContentfulFieldToTinaField(field);

    return {
      ...baseField,
      component: "text"
    }
  }
  // @ts-expect-error
  private static mapRichTextToField(field: ContentfulField): TinaField<AnyField> {}
  // @ts-expect-error
  private static mapObjectToField(field: ContentfulField): TinaField<AnyField> {}
  // @ts-expect-error
  private static mapNumberToField(field: ContentfulField): TinaField<AnyField> {}
  // @ts-expect-error
  private static mapIntegerToField(field: ContentfulField): TinaField<AnyField> {}
  // @ts-expect-error
  private static mapDateToField(field: ContentfulField): TinaField<AnyField> {}
  // @ts-expect-error
  private static mapBooleanToField(field: ContentfulField): TinaField<AnyField> {}
  // @ts-expect-error
  private static mapArrayToField(field: ContentfulField): TinaField<AnyField> {}
  private static handleUnmappedType(field: ContentfulField) {
    console.warn(`react-tinacms-contentful: Mapping for ${field.type} type not yet implemented`);

    return this.mapContentfulFieldToTinaField(field);
  }
}