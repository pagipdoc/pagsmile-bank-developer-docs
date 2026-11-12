const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const json = (file) => JSON.parse(read(file));
const config = json("docs.json");
const SANDBOX = "https://ebanking-openapi-sandbox.pagsmile.com.br";
const METHODS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
const LANGUAGES = ["bash", "python", "javascript", "go", "java", "php"];
const locales = [
  { language: "en", prefix: "", specFile: "openapi/en.json" },
  { language: "pt-BR", prefix: "pt-br/", specFile: "openapi/pt-br.json" },
].map((locale) => ({ ...locale, spec: json(locale.specFile) }));

function operations(spec) {
  return Object.entries(spec.paths).flatMap(([url, item]) => {
    assert(!item.$ref && !item.additionalOperations,
      `${url}: extend the contract checker before using referenced path items or custom methods`);
    for (const key of Object.keys(item)) {
      assert(METHODS.includes(key) || ["summary", "description", "servers", "parameters"].includes(key) || key.startsWith("x-"),
        `${url}: extend the contract checker for path item field or method ${key}`);
    }
    return METHODS.filter((method) => item[method]).map((method) => ({
      key: `${method.toUpperCase()} ${url}`, method: method.toUpperCase(), url,
      item, operation: item[method],
    }));
  });
}

function navigationPages(value) {
  if (Array.isArray(value)) return value.flatMap(navigationPages);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => key === "pages"
    ? child.flatMap((entry) => typeof entry === "string" ? [entry] : navigationPages(entry))
    : navigationPages(child));
}

function mdxFiles(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? mdxFiles(file) : file.endsWith(".mdx") ? [file] : [];
  });
}

function frontmatterField(source, field) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert(frontmatter, "Missing frontmatter");
  const value = frontmatter[1].match(new RegExp(`^${field}:\\s*(.+)$`, "m"))?.[1].trim();
  return value?.replace(/^(["'])(.*)\1$/, "$2");
}

// Remove translated prose, not protocol data or schema property names.
// Examples and code are reviewed separately: this comparison is structural.
const PROSE = new Set(["description", "summary", "title", "externalDocs", "tags",
  "x-codeSamples", "example", "examples"]);
const DICTIONARIES = new Set(["paths", "webhooks", "schemas", "properties", "parameters",
  "responses", "requestBodies", "headers", "securitySchemes", "callbacks", "$defs",
  "patternProperties", "dependentSchemas"]);
const LITERAL_DATA = new Set(["enum", "const", "default"]);
function protocol(value, dictionary = false) {
  if (Array.isArray(value)) return value.map((item) => protocol(item));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => dictionary || !PROSE.has(key))
    .map(([key, child]) => [key, dictionary ? protocol(child)
      : LITERAL_DATA.has(key) ? child : protocol(child, DICTIONARIES.has(key))]));
}

function visit(value, callback) {
  if (!value || typeof value !== "object") return;
  callback(value);
  Object.values(value).forEach((child) => visit(child, callback));
}

test("public site retains the agreed brand and production Banking entry point", () => {
  assert.equal(config.theme, "almond");
  assert.deepEqual(config.colors, { primary: "#0E2A4B", light: "#2BC196", dark: "#0E2A4B" });
  assert.equal(config.fonts.heading.family, "Space Grotesk");
  assert.equal(config.fonts.body.family, "Geist");
  assert.equal(config.navbar.primary.href, "https://banking.pagsmile.com.br/login");
});

test("online Playground configuration and all API server overrides stay in Sandbox", () => {
  assert.equal(config.api.playground.proxy, false);
  assert.deepEqual(config.api.openapi, locales.map((locale) => locale.specFile));
  for (const { spec, specFile } of locales) {
    const check = (servers, label) => {
      assert(Array.isArray(servers) && servers.length, `${label}: missing servers`);
      for (const server of servers) assert.equal(server.url, SANDBOX, `${label}: non-Sandbox target`);
    };
    check(spec.servers, specFile);
    for (const { key, item, operation } of operations(spec)) {
      if (item.servers) check(item.servers, `${specFile} ${key} path`);
      if (operation.servers) check(operation.servers, `${specFile} ${key} operation`);
    }
  }
});

test("English and pt-BR expose the same protocol structure", () => {
  assert.deepEqual(protocol(locales[0].spec), protocol(locales[1].spec));
});

test("public OpenAPI references resolve inside their own file", () => {
  for (const { spec, specFile } of locales) {
    visit(spec, (value) => {
      if (typeof value.$ref !== "string") return;
      assert(value.$ref.startsWith("#/"), `${specFile}: external reference ${value.$ref}`);
      const target = value.$ref.slice(2).split("/").map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"))
        .reduce((current, part) => current?.[part], spec);
      assert.notEqual(target, undefined, `${specFile}: unresolved ${value.$ref}`);
    });
  }
});

test("operations have unique IDs, authentication and six explicit code sample languages", () => {
  assert.deepEqual(config.api.examples.languages, LANGUAGES);
  assert.equal(config.api.examples.autogenerate, false);
  for (const { spec, specFile } of locales) {
    const ids = new Set();
    for (const { key, operation } of operations(spec)) {
      assert(operation.operationId && !ids.has(operation.operationId), `${specFile} ${key}: missing or duplicate operationId`);
      ids.add(operation.operationId);
      const security = operation.security ?? spec.security;
      assert(Array.isArray(security) && security.length, `${specFile} ${key}: missing authentication`);
      for (const requirement of security) {
        assert(Object.keys(requirement).length, `${specFile} ${key}: anonymous alternative`);
        for (const scheme of Object.keys(requirement)) {
          assert(spec.components.securitySchemes[scheme], `${specFile} ${key}: unknown security scheme ${scheme}`);
        }
      }
      const samples = operation["x-codeSamples"] ?? [];
      assert.deepEqual(samples.map((sample) => sample.lang).sort(), [...LANGUAGES].sort(), `${specFile} ${key}: code languages`);
      for (const sample of samples) assert(sample.source?.trim(), `${specFile} ${key}: empty ${sample.lang} sample`);
    }
  }
});

test("both navigation trees contain existing pages in matching business order", () => {
  assert.deepEqual(config.navigation.languages.map((locale) => locale.language), locales.map((locale) => locale.language));
  const pages = config.navigation.languages.map(navigationPages);
  assert.deepEqual(pages[0], pages[1].map((file) => {
    assert(file.startsWith("pt-br/"), `Portuguese navigation must use pt-br/: ${file}`);
    return file.slice(6);
  }));
  for (const list of pages) {
    assert.equal(new Set(list).size, list.length, "Duplicate navigation entry");
    for (const file of list) assert(fs.existsSync(path.join(root, `${file}.mdx`)), `Missing navigation page: ${file}`);
  }
});

test("each operation and webhook has one localized reference page in navigation", () => {
  for (const locale of locales) {
    const expected = new Set([
      ...operations(locale.spec).map(({ key }) => key),
      ...Object.keys(locale.spec.webhooks ?? {}).map((name) => `webhook ${name}`),
    ]);
    const seen = new Set();
    const nav = navigationPages(config.navigation.languages.find((item) => item.language === locale.language));
    for (const file of mdxFiles(`${locale.prefix}api-reference`)) {
      const source = read(file);
      const binding = frontmatterField(source, "openapi");
      if (!binding) continue;
      assert(binding.startsWith(`${locale.specFile} `), `${file}: wrong language spec`);
      const key = binding.slice(locale.specFile.length + 1);
      assert(expected.has(key), `${file}: unknown operation ${key}`);
      assert(!seen.has(key), `${file}: duplicate primary reference for ${key}`);
      seen.add(key);
      assert(nav.includes(file.slice(0, -4)), `${file}: missing from navigation`);
      for (const field of ["title", "sidebarTitle", "description"]) {
        assert(frontmatterField(source, field), `${file}: missing ${field}`);
      }
      for (const signer of source.matchAll(/<PlaygroundSigner\b([\s\S]*?)\/>/g)) {
        assert(!key.startsWith("webhook "), `${file}: callback pages must not send business requests`);
        const method = signer[1].match(/\bmethod="([^"]+)"/)?.[1];
        const url = signer[1].match(/\bpath="([^"]+)"/)?.[1];
        assert.equal(`${method} ${url}`, key, `${file}: signer and OpenAPI binding disagree`);
        assert.equal(method, "POST", `${file}: extend and test the signer before using a non-POST operation`);
        if (locale.prefix) assert(/\blang="pt"/.test(signer[1]), `${file}: missing Portuguese signer language`);
      }
    }
    assert.deepEqual([...seen].sort(), [...expected].sort(), `${locale.language}: missing reference pages`);
  }
});

test("Arazzo operation references exist in the corresponding public spec", () => {
  for (const locale of locales) {
    const file = locale.prefix ? "arazzo/pagsmile-workflows.pt-br.arazzo.yaml" : "arazzo/pagsmile-workflows.en.arazzo.yaml";
    const source = read(file);
    assert(source.includes(`url: ../${locale.specFile}`), `${file}: wrong source spec`);
    const ids = new Set(operations(locale.spec).map(({ operation }) => operation.operationId));
    const references = [...source.matchAll(/^\s+operationId:\s*([A-Za-z0-9_-]+)\s*$/gm)];
    assert(references.length, `${file}: no recognized operation references`);
    for (const [, id] of references) assert(ids.has(id), `${file}: unknown operationId ${id}`);
  }
});

test("Banking registration precedes business onboarding in both quickstarts", () => {
  for (const [file, first, second] of [
    ["quickstart.mdx", "Banking portal registration", "Business onboarding registration"],
    ["pt-br/quickstart.mdx", "Cadastro pelo portal Banking", "Cadastro pelo onboarding empresarial"],
  ]) {
    const source = read(file);
    const a = source.indexOf(`<Accordion title="${first}"`);
    const b = source.indexOf(`<Accordion title="${second}"`);
    assert(a >= 0 && b > a, `${file}: registration order changed`);
  }
});

test("maintainer documents, templates and tests are excluded from the customer site", () => {
  const ignored = new Set(read(".mintignore").split(/\r?\n/).map((line) => line.trim()));
  for (const pattern of ["README.md", "CONTRIBUTING.md", "AGENTS.md", ".mintlify/", "maintenance/", ".github/", "tests/"]) {
    assert(ignored.has(pattern), `.mintignore must exclude ${pattern}`);
  }
  for (const file of navigationPages(config.navigation)) {
    assert(!/^(maintenance|tests|\.github|\.mintlify)\//.test(file), `Maintainer file in public navigation: ${file}`);
    assert(!["README", "CONTRIBUTING", "AGENTS"].includes(file), `Maintainer page in navigation: ${file}`);
  }
});
