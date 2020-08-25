import { ContentType, Field } from 'contentful';
import { AnyField } from '@tinacms/forms';

export class ContentfulFormMapper {
  public static createFieldConfigFromContentType(contentType: ContentType): AnyField[] {
    return contentType.fields.reduce((tinaFields, field) => {
      switch (field.type) {
        case "Text":
          // TODO: short and long text handling
          // break;
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
          this.handleUnmappedType(field);
      }

      return tinaFields;
    }, []);
  }

  // @ts-expect-error
  private static mapTextToField(field: Field) {}
  // @ts-expect-error
  private static mapRichTextToField(field: Field) {}
  // @ts-expect-error
  private static mapObjectToField(field: Field) {}
  // @ts-expect-error
  private static mapNumberToField(field: Field) {}
  // @ts-expect-error
  private static mapIntegerToField(field: Field) {}
  // @ts-expect-error
  private static mapDateToField(field: Field) {}
  // @ts-expect-error
  private static mapBooleanToField(field: Field) {}
  // @ts-expect-error
  private static mapArrayToField(field: Field) {}
  private static handleUnmappedType(field: Field) { console.warn(`Mapping for ${field.type} type not yet implemented`) }
}