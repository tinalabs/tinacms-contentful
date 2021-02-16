import { ContentType } from "contentful";
import { getLocalizedFields } from "./locale";

describe('getLocalizedFields', () => {
  const locale = "en";
  const mockContentType: Partial<ContentType> = {
    fields: [
      { id: "foo", name: "foo", localized: true },
      { id: "foo", name: "bar", localized: false }
    ] as any
  }

  it('should localize basic fields when provided no content types', () => {
    const input = {
      foo: "bar"
    }
    const res = getLocalizedFields(input, {
      locale
    })

    expect(res).toEqual({
      foo: {
        [locale]: input.foo
      }
    })
  })

  it('should localize only localizable basic fields when provided the content type', () => {
    const input = {
      foo: "bar",
      bar: "foo"
    }
    const res = getLocalizedFields(input, {
      locale,
      contentType: mockContentType as any
    })

    expect(res).toEqual({
      foo: {
        [locale]: input.foo
      }
    })
  })
})