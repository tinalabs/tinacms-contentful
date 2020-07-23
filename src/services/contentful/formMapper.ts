import { ContentType, Field } from 'contentful';
import { AnyField } from '@tinacms/forms';

export class ContentfulFormMapper {
  public static CreateFieldConfigFromContentType(contentType: ContentType): AnyField[] {
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
          this.HandleUnmappedType(field);
      }

      return tinaFields;
    }, []);
  }

  private static MapTextToField(field: Field) {}
  private static MapRichTextToField(field: Field) {}
  private static MapObjectToField(field: Field) {}
  private static MapNumberToField(field: Field) {}
  private static MapIntegerToField(field: Field) {}
  private static MapDateToField(field: Field) {}
  private static MapBooleanToField(field: Field) {}
  private static MapArrayToField(field: Field) {}
  private static HandleUnmappedType(field: Field) { console.warn(`Mapping for ${field.type} type not yet implemented`) }
}