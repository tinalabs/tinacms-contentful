import mdx from "@next/mdx";

export function configureNext(config: any) {
  config.pageExtensions = ["js", "jsx", "ts", "tsx", "md", "mdx"];

  return withMDX(config);
}

const withMDX = mdx({
  extension: /\.mdx?$/,
});
