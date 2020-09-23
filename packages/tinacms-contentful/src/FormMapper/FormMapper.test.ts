import type { ContentType, Field as ContentfulField } from "contentful"
import type { Field as TinaField } from "tinacms";
import { createFieldConfigFromContentType } from "./index";

describe("FormMapper", () => {
  describe("createFieldConfigFromContentType", () => {
    let content_type: Omit<ContentType, "sys">;

    beforeEach(() => {
      content_type = {
        name: "test",
        description: "test",
        fields: [],
        displayField: "title",
        toPlainObject: function() { return this }
      }
    })

    it("should convert a Contentful Text field to a Tina text field", () => {
      const contentful_field: ContentfulField = {
        type: "Text",
        id: "test",
        name: "test",
        disabled: false,
        omitted: false,
        localized: false,
        required: true,
        validations: []
      }
      const tina_field: TinaField<any> = {
        name: contentful_field.name,
        label: contentful_field.name,
        component: "text"
      }

      content_type.fields.push(contentful_field);
      const res = createFieldConfigFromContentType(content_type as ContentType);

      expect(res[0]).toEqual(tina_field);
    })

    it("should convert an unsupported field type to a text field", () => {
      const contentful_field: ContentfulField = {
        type: "Link",
        id: "test",
        name: "test",
        disabled: false,
        omitted: false,
        localized: false,
        required: true,
        validations: []
      }
      const tina_field: TinaField<any> = {
        name: contentful_field.name,
        label: contentful_field.name,
        component: "text"
      }

      content_type.fields.push(contentful_field);
      const res = createFieldConfigFromContentType(content_type as ContentType);

      expect(res[0]).toEqual(tina_field);
    })
  })
})