exports.ids = [6];
exports.modules = {

/***/ "95al":
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
  }), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("h1", null, `Getting Started`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("hr", null), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("h2", null, `Pre-requisites`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `This documentation assumes you:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("ul", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("li", {
    parentName: "ul"
  }, `Are comfortable with `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "li"
  }, {
    "href": "https://tinacms.org/docs"
  }), `TinaCMS`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("li", {
    parentName: "ul"
  }, `Have a working `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "li"
  }, {
    "href": "https://tinacms.org/guides"
  }), `Tina site`), ` ready to setup with Contentful`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("li", {
    parentName: "ul"
  }, `Have a Contentful account and have setup access tokens to your space`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("h2", null, `Usage`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `First add the package to your site, along with the necessary contentful libraries:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `npm install react-tinacms-contentful contentful contentful-management`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `Then wrap the CMS with the provider:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {}), `const cms = new TinaCMS();

export const Cms({children}) {
  return (
    <TinaProvider cms={cms}>
      <ContentfulProvider>
        {children}
      </ContentfulProvider>
    </TinaProvider>
  )
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `Then we'll need to configure the CMS to talk to contentful. We'll pull any "secret" values out of environment variables`, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("sup", _extends({
    parentName: "p"
  }, {
    "id": "fnref-1"
  }), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "sup"
  }, {
    "href": "#fn-1",
    "className": "footnote-ref"
  }), `1`)), `.`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {
    "className": "language-diff"
  }), `+ import { ContentfulApiClient } from 'react-tinacms-contentful'
+
-const cms = new TinaCMS();
+const cms = new TinaCMS({
+  enabled: false,
+  sidebar: true,
+  apis: {
+    contentful: new ContentfulApiClient({
+      spaceId: process.env.CONTENTFUL_SPACE_ID,
+      defaultEnvironmentId: process.env.CONTENTFUL_DEFAULT_ENVIRONMENT_ID,
+      accessTokens: {
+       delivery: process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN,
+       preview: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
+      },
+      redirectUrl: "/"
+    })
+  }
+});

export const Cms({children}) {
  return (
    <TinaProvider cms={cms}>
      <ContentfulProvider>
        {children}
      </ContentfulProvider>
    </TinaProvider>
  )
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `You'll need to create a `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `.env`), ` file to store these "secrets" in the root of the project and fill in the blanks:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {
    "className": "language-ini"
  }), `CONTENTFUL_SPACE_ID=
CONTENTFUL_DEFAULT_ENVIRONMENT_ID=master
CONTENTFUL_DELIVERY_ACCESS_TOKEN=
CONTENTFUL_PREVIEW_ACCESS_TOKEN=
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `Finally, you'll need to setup you'll need to setup your editing route(s) to receive the redirect back from Contentful to finish the login workflow.
For the purposes of this demo, we'll assume it's the root route, or `, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("inlineCode", {
    parentName: "p"
  }, `"/"`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {
    "className": "language-diff"
  }), `+import { useContentfulAuthRedirect } from 'react-tinacms-contentful'

export const App() {
+  useContentfulAuthRedirect()
  ...
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `Now you should be able to enable the CMS and login with Contentful, either by:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {}), `const cms = new TinaCMS({
-  enabled: false,
+  enabled: true,
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("p", null, `or:`), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("pre", null, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("code", _extends({
    parentName: "pre"
  }, {
    "className": "language-diff"
  }), `+ import { useCallback } from 'react'
+ import { useCMS } from 'tina-cms'
import { useContentfulAuthRedirect } from 'react-tinacms-contentful'

export const App() {
+  const cms = useCMS()
+  const enableCMS = useCallback(() => cms.enable())
+
  useContentfulAuthRedirect() 
  ...
+    return ( 
+    ...
+      <Button onClick={enableCMS}>Enable CMS
+    ...
+    )
  )
}
`)), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("div", {
    "className": "footnotes"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("hr", {
    parentName: "div"
  }), Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("ol", {
    parentName: "div"
  }, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("li", _extends({
    parentName: "ol"
  }, {
    "id": "fn-1"
  }), `we store "secrets" in environment variables so they can be changed dynamically at deploy time. This also keeps them out of source code, which can cause problems.`, Object(_mdx_js_react__WEBPACK_IMPORTED_MODULE_1__["mdx"])("a", _extends({
    parentName: "li"
  }, {
    "href": "#fnref-1",
    "className": "footnote-backref"
  }), `↩`)))));
}
;
MDXContent.isMDXComponent = true;

/***/ })

};;