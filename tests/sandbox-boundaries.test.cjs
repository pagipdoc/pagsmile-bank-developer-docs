const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const SANDBOX = "https://ebanking-openapi-sandbox.pagsmile.com.br";
const PRODUCTION = "https://ebanking-openapi.pagsmile.com.br";
const oldCredentials = () => ({
  env: "production",
  account: { ak: "ak_acct_old_test", sk: "sk_acct_old_test" },
  user: null,
});

// Exercise the real component handlers with a small hook harness. The JSX view
// starts at each marker and is omitted, so these tests need no React/build deps.
// Browser rendering and native Mintlify Playground remain separate UI checks.
function mount(file, name, marker, exposed, credentials) {
  const source = fs.readFileSync(path.join(root, "snippets", file), "utf8");
  const boundary = source.indexOf(marker);
  assert(boundary > 0, `Handler/view boundary not found in ${file}`);
  const handlerSource = source.slice(0, boundary).replace("export const", "const")
    + `\nreturn { ${exposed} };\n};\nthis.Component = ${name};`;
  const states = [], refs = [], effects = [], calls = [];
  let stateIndex = 0, refIndex = 0, first = true;
  const window = {
    __pgsDocsCreds: credentials,
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
  };
  const context = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], (value) => {
        states[index] = typeof value === "function" ? value(states[index]) : value;
      }];
    },
    useRef(initial) {
      const index = refIndex++;
      return refs[index] || (refs[index] = { current: initial });
    },
    useEffect(effect) { if (first) effects.push(effect); },
    window,
    document: { getElementById: () => null },
    navigator: { clipboard: { writeText: async () => {} } },
    crypto: webcrypto, TextEncoder, Uint8Array, URL, AbortController, Event,
    setTimeout, clearTimeout,
    async fetch(url, options) {
      calls.push({ url, options });
      return {
        status: 200,
        text: async () => String(url).endsWith("/cdn-cgi/trace")
          ? "ip=203.0.113.4\n" : JSON.stringify({ code: 200, data: {} }),
      };
    },
  };
  vm.createContext(context);
  vm.runInContext(handlerSource, context, { filename: file });
  function render() {
    stateIndex = 0;
    refIndex = 0;
    const view = context.Component({});
    if (first) {
      first = false;
      effects.forEach((effect) => effect());
      return render();
    }
    return view;
  }
  render();
  return { render, calls, window, source };
}

test("credential setup clears legacy Production keys and only exports/tests Sandbox", async () => {
  const harness = mount("credential-setup.jsx", "CredentialSetup", "  const input =", "save, clear, set, test, envText, saved, f", oldCredentials());
  assert.equal(harness.window.__pgsDocsCreds.env, "sandbox");
  assert.equal(harness.window.__pgsDocsCreds.account, null);
  let view = harness.render();
  view.set("account", "ak", "ak_acct_doc_test");
  view = harness.render();
  view.set("account", "sk", "sk_acct_doc_test");
  view = harness.render();
  view.save();
  view = harness.render();
  assert.equal(view.saved.env, "sandbox");
  for (const powershell of [false, true]) {
    const output = view.envText(view.saved.account, powershell, true);
    assert(output.includes(SANDBOX));
    assert(!output.includes(PRODUCTION));
  }
  await view.test("account");
  assert.equal(harness.calls.length, 1);
  assert.equal(new URL(harness.calls[0].url).origin, SANDBOX);
  view.clear();
  assert.equal(harness.window.__pgsDocsCreds.account, null);
});

test("signer rejects a Production destination even if its generated request is modified", async () => {
  const harness = mount("playground-signer.jsx", "PlaygroundSigner", "  const field =", "generate, sendNow, setC, out, msg, checkVector", oldCredentials());
  assert.equal(harness.window.__pgsDocsCreds.account, null);
  let view = harness.render();
  view.setC("ak")("ak_acct_doc_test");
  view.setC("sk")("sk_acct_doc_test");
  view = harness.render();
  await view.generate();
  view = harness.render();
  assert(view.out.curl.includes(SANDBOX));
  assert(!view.out.curl.includes(PRODUCTION));
  view.out.send.url = PRODUCTION + "/v3/bank_account";
  await view.sendNow();
  assert.equal(harness.calls.length, 0);
  view = harness.render();
  assert.equal(view.msg, "This tool sends requests to Sandbox only.");
  view.out.send.url = SANDBOX + "/v3/bank_account";
  await view.sendNow();
  assert.equal(harness.calls.length, 1);
  assert.equal(new URL(harness.calls[0].url).origin, SANDBOX);
  await harness.render().checkVector();
  assert.equal(harness.render().msg, "The test vector matches: the local implementation is correct.");
});

test("IP detection never probes Production", async () => {
  const harness = mount("ip-allowlist-helper.jsx", "IpAllowlistHelper", "  const rows =", "detect");
  await new Promise(setImmediate);
  assert.equal(harness.calls.length, 1);
  assert.equal(harness.calls[0].url, SANDBOX + "/cdn-cgi/trace");
});

for (const locale of ["en", "pt-br"]) {
  test(`${locale} native Playground has no Production server or operation override`, () => {
    const spec = JSON.parse(fs.readFileSync(path.join(root, "openapi", locale + ".json"), "utf8"));
    let serverLists = 0;
    function inspect(value) {
      if (!value || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value)) {
        if (key === "servers") {
          serverLists++;
          assert.equal(child.length, 1);
          assert.equal(child[0].url, SANDBOX);
          assert.equal(child[0].variables, undefined);
        }
        inspect(child);
      }
    }
    inspect(spec);
    assert.equal(serverLists, 1);
  });
}
