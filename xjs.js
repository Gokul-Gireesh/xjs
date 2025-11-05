import { writeFile, mkdir } from "fs/promises";
import { dirname } from "path";


function createFile(path) {
  return {
    async with(content) {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, "utf8");
    }
  };
}

// html
function html(strings, ...values) {
  const object = Array.isArray(strings) ? (rendered) => {
    const reserve = html.useContext;
    html.useContext = () => {
      throw new Error("should use html.useContext inside registered components");
    }
    const string = strings.reduce((result, str, i) => {
      let value = values[i];
      if (Array.isArray(value)) {
        value = value.map(v => (typeof v === "function" ? v(result + str) : v)).join("");
      } else if (typeof value === "function") {
        value = value(result + str) ?? "";
      } else if (typeof value === "string") {
        value = html.escape(value);
      } else if (typeof value === "number") {
        value = html.escape(String(value));
      } else if (value === undefined || value === null) {
        value = "";
      }
      
      return result + str + value;
    }, "");
    html.useContext = reserve;
    return string;
  } : (rendered) => {
    return strings;
  }
  
  return object;
}
html.escape = (string) => {
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
html.unescape = (string) => {
  return string
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
html.use = (callback) => {
  const reserve = html.useContext;
  if(reserve === undefined) {
    throw new Error("should use html.use inside components chained from html.render");
  }
  const fn = (rendered) => callback(reserve())(rendered);
  fn.with = (props, {...context} = reserve()) => {
    html.useContext = (value) => value ? context[value] : context;
    const object = callback(props);
    html.useContext = reserve;
    return object;
  }
  return fn;
}
html.useContext = () => {
  throw new Error("should use html.useContext inside registered components");
}
html.file = (callback, props, context = {}, path = `./${callback.name || "index"}.html`) => {
  createFile(path).with(html.render(callback, props, context));
  return path;
}
html.render = (callback, props = {}, context = props) => {
  const reserve = html.useContext;
  html.useContext = (value) => value ? context[value] : context;
  const object = html.use(callback).with(props, context);
  html.useContext = reserve;
  return object();
}


// css
function css(strings, ...values) {
  const object = Array.isArray(strings) ? (rendered) => {
    const reserve = css.useContext;
    css.useContext = () => {
      throw new Error("should use css.useContext inside registered components");
    }
    const string = strings.reduce((result, str, i) => {
      let value = values[i];
      if (Array.isArray(value)) {
        value = value.map(val => (typeof val === "function" ? val(result + str) : val)).join("");
      } else if (typeof value === "function") {
        value = value(result + str) ?? "";
      } else if (typeof value === "string") {
        null;
      } else if (value === undefined || value === null) {
        value = "";
      }
      
      return result + str + value;
    }, "");
    css.useContext = reserve;
    return string;
  } : (rendered) => {
    const reserve = css.useContext;
    css.useContext = () => {
      throw new Error("should use css.useContext inside registered components");
    }
    let string = "";
    for (const key in strings) {
      const value = typeof strings[key] === "function" ? strings[key](key) : strings[key];

      if (typeof value === "number") {
        string += `${key}: ${value};`;
      } else if (typeof value === "string") {
        string += `${key}: ${value};`;
      } else if (typeof value === "object") {
        string += `${key} {${css(value)(string)}}`;
      }
    }
    css.useContext = reserve;
    return string;
  }
  return object;
}
css.use = (callback) => {
  const reserve = css.useContext;
  if(reserve === undefined) {
    throw new Error("should use css.use inside components chained from css.render");
  }
  const fn = (rendered) => callback(reserve())(rendered);
  fn.with = (props, {...context} = reserve()) => {
    css.useContext = (value) => value ? context[value] : context;
    const object = callback(props);
    css.useContext = reserve;
    return object;
  }
  return fn;
}
css.useContext = () => {
  throw new Error("should use css.useContext inside registered components");
}
css.inner = (callback, props, context = {}) => {
  return `<style>${css.render(callback, props, context).replace(/\s+/g, " ")}</style>`;
}
css.inline = (callback, props, context = {}) => {
  return `style="${css.render(callback, props, context).replace(/\s+/g, " ")}"`;
}
css.module = (callback, props, context = {}) => {
  const className = `c${Math.random().toString(36).slice(2, 8)}`;
  const styles = css.render(callback, props, context).replace(/\s+/g, " ");
  return {
    className,
    style: `<style>.${className}{${styles}}</style>`,
  };
};
css.file = (callback, props, context = {}, path = `./${callback.name || "index"}.css`) => {
  createFile(path).with(css.render(callback, props, context));
  return `<link rel="stylesheet" href="${path}">`;
}
css.render = (callback, props = {}, context = props) => {
  const reserve = css.useContext;
  css.useContext = (value) => value ? context[value] : context;
  const object = css.use(callback).with(props, context);
  css.useContext = reserve;
  return object();
}


export {html, css};
export default {html, css};
