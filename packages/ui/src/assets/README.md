# Design assets

Shared by every app. Delete anything that stops being referenced.

| File                            | Used by                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| `fonts/Satoshi-Variable*.woff2` | `@font-face` rules in `../styles/globals.css` (every app). One variable file covers weights 300–900; `.woff` / `.ttf` are fallbacks. |

App images stay in that app's `public/images` (landing: hero, about, features; web: auth backgrounds, empty
states, invoice templates), because `next/image` and CSS backgrounds need a plain URL. The logos are raster
images wrapped in SVG, so they can't be inlined as components; each app keeps its own copy.
