exports.ids = [8];
exports.modules = {

/***/ "qn5M":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return MDXContent; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("cDcd");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _mdx_js_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("c2Xn");
/* harmony import */ var _mdx_js_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__);
var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



/* @jsxRuntime classic */

/* @jsx mdx */

const layoutProps = {};
const MDXLayout = "wrapper";
function MDXContent(_ref) {
  let {
    components
  } = _ref,
      props = _objectWithoutProperties(_ref, ["components"]);

  return Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])(MDXLayout, _extends({}, layoutProps, props, {
    components: components,
    mdxType: "MDXLayout"
  }), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("h1", null, `Editing Entries`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("hr", null), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `On this page, we'll cover how to edit entries with `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `react-tinacms-contentful`), `. There is also a list of `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "p"
  }, {
    "href": "#faqs"
  }), `Frequently Asked Questions (FAQs)`), `.`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("h2", null, `Editing A Single Entry`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `Editing a single entry can be done via the `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `useContentfulEntryForm`), ` hook.`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `Fetch an entry and pass it to `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `useContentfulEntryForm`), `, and you will receive a `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `modifiedEntry`), ` and `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `form`), ` object.`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {}), `export function Page() {
  const [entry, loading, error] = useContentfulEntry(entryId);
  const [modifiedEntry, form] = useContentfulEntryForm(entry, {
    fields: [
      { name: "fields.title", label: "Title", component: "text" }
    ]
  });

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <main>
      {loading && "Loading..."}
      {entry && entry.fields.title}
    </main>
  )
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("table", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("thead", {
    parentName: "table"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("tr", {
    parentName: "thead"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("th", _extends({
    parentName: "tr"
  }, {
    "align": null
  }), `name`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("th", _extends({
    parentName: "tr"
  }, {
    "align": null
  }), `description`))), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("tbody", {
    parentName: "table"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("tr", {
    parentName: "tbody"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("td", _extends({
    parentName: "tr"
  }, {
    "align": null
  }), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "td"
  }, `modifiedEntry`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("td", _extends({
    parentName: "tr"
  }, {
    "align": null
  }), `The entry data returned from the form, to re-render the page with draft form data`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("tr", {
    parentName: "tbody"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("td", _extends({
    parentName: "tr"
  }, {
    "align": null
  }), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "td"
  }, `form`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("td", _extends({
    parentName: "tr"
  }, {
    "align": null
  }), `A TinaCMS `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "td"
  }, `Form`), ` object to be used with `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "td"
  }, `usePlugin`), ` or `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "td"
  }, `InlineForm`))))), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `You can also pass `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "p"
  }, {
    "href": "https://tina.io/docs/plugins/forms/#form-configuration"
  }), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "a"
  }, `FormOptions`)), ` to the hook to further customize the form:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {
    "className": "language-diff"
  }), `export function Page() {
  const [entry, loading, error] = useContentfulEntry(entryId);
  const [modifiedEntry, form] = useContentfulEntryForm(entry, {
+   id: "page",
    fields: [
      { name: "fields.title", label: "Title", component: "text" }
    ]
+   onChange: (values) => console.log(values)
+ });

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <main>
      {loading && "Loading..."}
      {entry && entry.fields.title}
    </main>
  )
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `Finally, you can also create a custom form altogether if you need full control:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {}), `export function Page() {
  const contentful = useContentful();
  const [entry, loading, error] = useContentfulEntry(entryId);
  const [modifiedEntry, form] = useForm({
    id: "page",
    fields: [
      { name: "fields.title", label: "Title", component: "text" }
    ],
    onChange: (values) => console.log(values),
    onSubmit: (values) => contentful.updateEntry(entryId, values)
  });

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <main>
      {loading && "Loading..."}
      {entry && entry.fields.title}
    </main>
  )
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("blockquote", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("h3", {
    parentName: "blockquote"
  }, `Pro Tips`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", {
    parentName: "blockquote"
  }, `See the `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "p"
  }, {
    "href": "https://tina.io/docs/plugins/forms/"
  }), `TinaCMS form documentation for more info`), `.
See the API documentation for `, `[`, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `useContentful`), `]`, ` and `, `[`, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `useContentfulEntry`), `]`, `.`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("h2", null, `Editing Referenced Entries`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `You can also create a form that will edit an entry and allow editing of its children, up to 10 levels of nesting.`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `This is done by passing `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `references: true`), ` in the form's options.`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {
    "className": "language-diff"
  }), `export function Page() {
  const contentful = useContentful();
  const [entry, loading, error] = useContentfulEntry(entryId);
  const [modifiedEntry, form] = useForm({
    id: "page",
    fields: [
      { name: "fields.title", label: "Title", component: "text" }
    ]
    onChange: (values) => console.log(values),
    onSubmit: (values) => contentful.updateEntry(entryId, values),
+   references: true 
  });

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <main>
      {loading && "Loading..."}
      {entry && entry.fields.title}
    </main>
  )
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `This will then allow the form fields to edit the fields of references. For example, if we had a post content type:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {}), `type PostEntry {
  title: string
  created: Date
  edited: Date
  author: AuthorEntry
}

type AuthorEntry {
  firstName: string
  lastName: string
  bio: string
  photo: Asset
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `We can edit the the author data by setting up form fields to access them:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {
    "className": "language-diff"
  }), `export function Page() {
  const contentful = useContentful();
  const [entry, loading, error] = useContentfulEntry(entryId);
  const [modifiedEntry, form] = useForm({
    id: "page",
    fields: [
      { name: "fields.title", label: "Title", component: "text" },
      { name: "fields.author", label: "Author", component: "group", fields: [
        { name: "fields.firstName", label: "First Name", component: "text" },
        { name: "fields.lastName", label: "First Name", component: "text" },
        { name: "fields.bio", label: "Bio", label: "Keep it short. 250 words or less", component: "textarea" },
        { name: "fields.photo", label: "Photo", component: "image" }
      ]}
    ]
    onChange: (values) => console.log(values),
    onSubmit: (values) => contentful.updateEntry(entryId, values),
    references: true 
  });

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <main>
      {loading && "Loading..."}
      {entry && entry.fields.title}
    </main>
  )
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `If the entry being edited already has an author, then you'll be able to update that author, otherwise, it will create a new author.`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("h2", null, `FAQs`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("ol", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("li", {
    parentName: "ol"
  }, `What happens on write?`, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("blockquote", {
    parentName: "li"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", {
    parentName: "blockquote"
  }, `That depends. If you're looking to write back a single entry, then write back updates only the fields on that entry, and none of its relationships.
However, if you're looking to update an entry and its children, then see `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "p"
  }, {
    "href": "#editing-nested-referenced-entries"
  }), `Editing Nested & Referenced Entries`)))), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("li", {
    parentName: "ol"
  }, `What happens to references?`, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("blockquote", {
    parentName: "li"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", {
    parentName: "blockquote"
  }, `See `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "p"
  }, {
    "href": "#editing-nested-referenced-entries"
  }), `Editing Nested & Referenced Entries`))))));
}
;
MDXContent.isMDXComponent = true;

/***/ })

};;