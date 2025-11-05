# xjs — Minimal HTML & CSS Templating for Node.js

xjs is a tiny, dependency-free library for writing HTML and CSS in plain JavaScript.  
It’s built for server-side rendering and component-based composition — no JSX, no bundlers.  
Where JSX is “JavaScript from HTML”, xjs is “HTML from JavaScript”.

---

## Why xjs?

I built xjs because sometimes you just want to generate clean HTML and CSS on the server without the overhead of React, JSX, or heavy templating engines.  
xjs keeps it simple and straightforward — no need to learn a new syntax for something this simple. 
xjs gives you:

- Clean, component-like syntax with plain JavaScript  
- Context passing and composition via `html.use()` / `html.useContext()`  
- Recursive CSS object syntax for concise styles  
- Zero dependencies — outputs simple strings you can `res.send()` or write to disk  
- Intended for static site generation, emails, Express SSR, small tools or demos

---

## Installation

```bash
# install from GitHub
npm install github:Gokul-Gireesh/xjs

# or via HTTPS
npm install https://github.com/Gokul-Gireesh/xjs.git
```

---

## HTML Components

xjs components are plain functions that return `html`-tagged templates or accept object syntax.

```js
import { html } from "xjs";

const Header = html(() => html`
  <header><h1>${html.useContext("title")}</h1></header>
`);

const Layout = html(() => {
  const { content } = html.useContext();
  return html`
    <html>
      <body>
        ${html.use(Header)}
        <main>${content}</main>
      </body>
    </html>
  `;
});

console.log(html.render(Layout, {
  title: "Home",
  content: html`<p>This is the main section.</p>`
}));
```

**Output:**
```html
<html>
  <body>
    <header><h1>Home</h1></header>
    <main><p>This is the main section.</p></main>
  </body>
</html>
```

### Quick object-to-HTML helper (optional)
xjs includes a minimal helper so you can use small object structures as shorthands:
```js
import { html } from "xjs";

const page = html({
  html: {
    head: { title: "xjs Example" },
    body: {
      ".": { lang: "en" },
      h1: "Hello, world!",
      p: "Rendered via object syntax."
    }
  }
});

console.log(page());
```

---

## CSS Usage

### Object syntax (recommended)
```js
import { css } from "xjs";

const styles = css({
  body: {
    background: "#fafafa",
    color: "#111",
    h1: {
      "font-size": "24px",
      color: "royalblue"
    }
  }
});

console.log(styles);
```

**Output (approx):**
```css
body {background: #fafafa;color: #111;}
h1 {font-size: 24px;color: royalblue;}
```

### Template literal syntax
```js
const button = css`
  ${css(button {
    background: black;
    color: white;
  })}
`;
```

---

## Writing Files

Render and write files easily (helpers create directories automatically):

```js
html.file(page, { title: "Home" }, {}, "./dist/index.html");
css.file(style, {}, {}, "./dist/style.css");
```

---

## Context Example

Context is read-only inside components. You can pass a context object down or create a new one with `.use().with()`.

```js
const Button = html(() => {
  const { label, color } = html.useContext();
  return html`<button style="color:${color}">${label}</button>`;
});

console.log(html.render(Button, { label: "Click Me", color: "royalblue" }));
```

---

## Inline, Inner, and Module CSS

- `css.inline(fn)` — returns a `style="..."` string you can put on an element  
- `css.inner(fn)` — returns a `<style>...</style>` string to embed into the head  
- `css.module(fn)` — returns `{ className, style }` where `style` is a `<style>` block and `className` is a generated class

Examples:
```js
css.inline(() => (css`${css({ color: "red" })}`));
// => 'style="color:red;"'

css.inner(() => (css`${css({ body: { background: "white" })}` }));
// => '<style>body {background:white;}</style>'

css.module(() => (css`${css({ background: "black" })}`));
// => { className: "cxxxxxx", style: "<style>.cxxxxxx{background:black}</style>" }
```

---

## Escaping Helpers

Interpolated values in `html`` are HTML-escaped by default. Use these helpers if you need them:

```js
html.escape("<p>");        // "&lt;p&gt;"
html.unescape("&lt;p&gt;") // "<p>"
```

If you intentionally want unescaped content, pass HTML via a function/component that returns an `html` result (semantic — treated as HTML) or use html(string).

---

## Reference

**HTML**
- `html(templateFn | templateLiteral | object)` — create a template/component. Returns a callable object that renders to string.  
- `html.render(component, context)` — render the component; `context` is available via `html.useContext()`.  
- `html.use(component)` — include a child component (component must be an `html` component).  
- `html.useContext(key?)` — access context (optionally a named key).  
- `html.file(component, props, context, path)` — write rendered HTML to disk.

**CSS**
- `css(object | templateLiteral)` — create CSS string from object or template literal.  
- `css.inline(fn)`, `css.inner(fn)`, `css.module(fn)` — helper variants.  
- `css.file(component, props, context, path)` — write CSS to disk.

---

## Example with Express

```js
import express from "express";
import { html } from "xjs";

const app = express();

function home() {
  const locals = html.useContext();
  return html`
    <html>
      <body>
        <h1>${locals.title}</h1>
        <p>Welcome to ${locals.appName}!</p>
      </body>
    </html>
  `;
}

app.get("/", (req, res) => {
  res.send(html.render(home, { title: "Home", appName: "xjs Demo" }));
});

app.listen(3000);
```

> Tip: you can register an Express view engine wrapper that returns `html.render(component, props)` so you can reuse existing `res.render` patterns.

---

## Design Philosophy

xjs is intentionally minimal:

- No virtual DOM or heavy runtime  
- No compilation step — just functions returning strings  
- Use plain JavaScript for control flow (loops, conditions, helpers)  
- Make server HTML/CSS generation readable and debuggable

xjs is best for small SSR apps, static site generation, email templates, or where minimalism and transparency matter.

---

## Contributing

Open issues - I'm happy to help

---

## License

MIT © Gokul Gireesh, 2025