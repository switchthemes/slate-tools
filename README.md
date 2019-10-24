# switchthemes/slate-tools
Slate 0.x with basic Section themes support

Based on [stylehatch/slate-tools](https://github.com/stylehatch/slate-tools)

## Installation notes

### Update Themekit binaries

Make sure the global Themekit binary is up to date:

`theme version`   
`theme update`

Also make sure the theme’s local Themekit binary is up to date:

`node_modules/@shopify/themekit/bin/theme version`   
`node_modules/@shopify/themekit/bin/theme update`

If you’ll be making changes to `slate-tools` code in place, make sure its local Themekit binary is up to date, too:

`node_modules/@shopify/slate-tools/node_modules/@shopify/themekit/bin/theme version`   
`node_modules/@shopify/slate-tools/node_modules/@shopify/themekit/bin/theme update`

## Inline snippets and the `inline` keyword

This fork of Slate provides an `inline` keyword that you can use to place a Liquid “snippet” file’s contents inside another Liquid file during the build process. (This is not the same as Shopify’s own snippets, which live in the `snippets` subdirectory, are pushed to Shopify servers, and are expanded dynamically.)

To inline a snippet, place it in an `inline` subdirectory inside `src`.

Then, use the `inline` keyword in another Liquid file: 

`{% inline 'snippet-name' %}`

This will place the contents of `src/inline/snippet-name.liquid` in the calling file. If the snippet file is not found, an error message will be output instead.

As this is a local build step, no additional files or directories will be created in the `dist` folder or pushed to Shopify servers.

*Big thanks to [AdamK-PXU](https://github.com/AdamK-PXU) at Pixel Union for generously sharing his local snippets code, which this is adapted from.*
