const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createHash, createHmac, webcrypto } = require("node:crypto");

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
function mount(file, name, marker, exposed, credentials, props = {}) {
  const source = fs.readFileSync(path.join(root, "snippets", file), "utf8");
  const boundary = source.indexOf(marker);
  assert(boundary > 0, `Handler/view boundary not found in ${file}`);
  const handlerSource = source.slice(0, boundary).replace("export const", "const")
    + `\nreturn { ${exposed} };\n};\nthis.Component = ${name};`;
  const states = [], refs = [], effects = [], calls = [], focused = [];
  let stateIndex = 0, refIndex = 0, effectIndex = 0, pendingEffects = [];
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
    useEffect(effect, deps) {
      const index = effectIndex++;
      const previous = effects[index];
      if (!previous || !deps || deps.some((value, i) => !Object.is(value, previous[i]))) {
        effects[index] = deps;
        pendingEffects.push(effect);
      }
    },
    window,
    document: { getElementById: (id) => ({ focus: () => focused.push(id) }) },
    navigator: { clipboard: { writeText: async () => {} } },
    crypto: webcrypto, TextEncoder, Uint8Array, URL, AbortController, Event,
    setTimeout, clearTimeout,
    async fetch(url, options) {
      calls.push({ url, options });
      return {
        ok: true,
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
    effectIndex = 0;
    const view = context.Component(props);
    if (pendingEffects.length) {
      const scheduled = pendingEffects;
      pendingEffects = [];
      scheduled.forEach((effect) => effect());
      return render();
    }
    return view;
  }
  render();
  return { render, calls, window, source, focused };
}

test("credential errors preserve saved keys and focus the missing field", () => {
  const harness = mount("credential-setup.jsx", "CredentialSetup", "  const input =", "save, clear, set, saved, issues, msgType");
  let view = harness.render();
  view.save();
  view = harness.render();
  assert.equal(view.msgType, "error");
  assert.equal(harness.focused.at(-1), "cs-account-ak");
  view.set("account", "ak", "ak_acct_doc_test");
  harness.render().save();
  view = harness.render();
  assert.equal(view.msgType, "error");
  assert.equal(harness.focused.at(-1), "cs-account-sk");
  assert.deepEqual(Array.from(view.issues("account")[0].fields), ["sk"]);
  assert.equal(view.saved.account, null);
  view.set("account", "sk", "sk_acct_doc_test");
  harness.render().save();
  view = harness.render();
  assert.equal(view.msgType, "success");
  view.set("account", "sk", "");
  harness.render().save();
  view = harness.render();
  assert.equal(view.msgType, "error");
  assert.equal(view.saved.account.sk, "sk_acct_doc_test");
  view.clear();
  view = harness.render();
  assert.equal(view.msgType, "success");
  assert.equal(view.saved.account, null);
  assert.equal(harness.calls.length, 0);
});

test("signer validation focuses missing keys and input edits clear the old error and signature", async () => {
  const harness = mount("playground-signer.jsx", "PlaygroundSigner", "  const field =", "generate, setC, invalidate, invalidFields, msgType, out, checkVector");
  let view = harness.render();
  await view.generate();
  view = harness.render();
  assert.equal(view.msgType, "error");
  assert.deepEqual(Array.from(view.invalidFields), ["ak", "sk"]);
  assert.equal(harness.focused.at(-1), "-v3-bank-account-ak");
  view.invalidate();
  view.setC("ak")("ak_acct_doc_test");
  view = harness.render();
  assert.equal(view.msgType, "info");
  assert.equal(view.invalidFields.length, 0);
  await view.generate();
  view = harness.render();
  assert.deepEqual(Array.from(view.invalidFields), ["sk"]);
  assert.equal(harness.focused.at(-1), "-v3-bank-account-sk");
  view.invalidate();
  view.setC("sk")("sk_acct_doc_test");
  view = harness.render();
  await view.generate();
  view = harness.render();
  assert(view.out);
  view.invalidate();
  view = harness.render();
  assert.equal(view.out, null);
  assert.equal(view.msgType, "info");
  await view.checkVector();
  assert.equal(harness.render().msgType, "success");
  assert.equal(harness.calls.length, 0);
});

test("signer validation identifies the first relevant field without generating or sending", async (t) => {
  const cases = [
    { name: "swapped keys", ak: "sk_acct_doc_test", sk: "ak_acct_doc_test", fields: ["ak", "sk"] },
    { name: "AK prefix", ak: "doc_test", fields: ["ak"] },
    { name: "SK characters", sk: "sk_acct_doc_test!", fields: ["sk"] },
    { name: "user-only operation", props: { scope: "user" }, fields: ["ak"] },
    { name: "missing account headers", ak: "ak_user_doc_test", fields: ["ispb", "acct"] },
    { name: "partial account headers", ak: "ak_user_doc_test", ispb: "12345678", fields: ["acct"] },
    { name: "invalid JSON", body: "{", fields: ["body"] },
    { name: "invalid editable path", props: { editable: true }, path: "/v3/../bank_account", fields: ["p"] },
  ];
  for (const c of cases) {
    await t.test(c.name, async () => {
      const harness = mount("playground-signer.jsx", "PlaygroundSigner", "  const field =", "generate, setC, setText, setP, invalidFields, msgType, out", undefined, c.props);
      let view = harness.render();
      view.setC("ak")(c.ak || "ak_acct_doc_test");
      view.setC("sk")(c.sk || "sk_acct_doc_test");
      if (c.ispb) view.setC("ispb")(c.ispb);
      if (c.body) view.setText(c.body);
      if (c.path) view.setP(c.path);
      await harness.render().generate();
      view = harness.render();
      assert.equal(view.msgType, "error");
      assert.deepEqual(Array.from(view.invalidFields), c.fields);
      assert.equal(harness.focused.at(-1), `-v3-bank-account-${c.fields[0]}`);
      assert.equal(view.out, null);
      assert.equal(harness.calls.length, 0);
    });
  }
});

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

test("IP helper matches IPv4/CIDR input boundaries and returns reusable network addresses", () => {
  const harness = mount("ip-allowlist-helper.jsx", "IpAllowlistHelper", "  return (", "check");
  const view = harness.render();
  for (const value of ["203.0.113.42", "203.0.113.42/32", "203.0.113.42/24", "128.3.4.5/1", "128.3.4.5/01"]) {
    const checked = view.check(value);
    assert.equal(checked.bad, undefined, value);
    assert.equal(view.check(checked.normalized).bad, undefined, `Reusable output for ${value}`);
  }
  assert.equal(view.check("203.0.113.42/24").normalized, "203.0.113.0/24");
  assert.equal(view.check("203.0.113.42/32").normalized, "203.0.113.42");
  assert.equal(view.check("128.3.4.5/1").normalized, "128.0.0.0/1");
  for (const value of ["203.0.113.42/0", "203.0.113.42/33", "203.0.113.42/003", "203.0.113.256", "203.0.113.042", "203.0.113.42/24/1", "2001:db8::1", "2001:4860::8888/64", "2001:4860::8888", "0.1.2.3", "127.0.0.1", "224.0.0.1", "255.255.255.255", "1.2.3.4/1"]) {
    assert(view.check(value).bad, value);
  }
  assert(view.check("192.168.1.2").warn.length);
});

test("IP helper deduplicates normalized entries before enforcing the ten-entry limit", () => {
  const harness = mount("ip-allowlist-helper.jsx", "IpAllowlistHelper", "  return (", "setCur, setAdd, list, value, overLimit, hasBad");
  let view = harness.render();
  const ten = Array.from({ length: 10 }, (_, i) => `203.0.113.${i + 1}`);
  view.setCur(ten.join("\n"));
  view.setAdd("203.0.113.1/32，203.0.113.2/32");
  view = harness.render();
  assert.equal(view.list.length, 10);
  assert.equal(view.overLimit, false);
  assert.equal(view.value, ten.join(","));
  view.setAdd("203.0.113.11");
  view = harness.render();
  assert.equal(view.overLimit, true);
  assert.equal(view.value, "");
  view.setCur("203.0.113.42/24");
  view.setAdd("203.0.113.0/24,203.0.113.200/24");
  view = harness.render();
  assert.equal(view.list.length, 1);
  assert.equal(view.value, "203.0.113.0/24");
  view.setAdd("::1");
  view = harness.render();
  assert.equal(view.hasBad, true);
  assert.equal(view.value, "");
});

test("IPv6 detection remains visible but is never offered as an IPv4 allowlist entry", async () => {
  const harness = mount("ip-allowlist-helper.jsx", "IpAllowlistHelper", "  return (", "setSeen, detected, v6rows");
  await new Promise(setImmediate);
  harness.render().setSeen({ sandbox: "2001:4860::8888" });
  const view = harness.render();
  assert.equal(view.detected.length, 0);
  assert.equal(view.v6rows.length, 1);
  assert.equal(view.v6rows[0][1], "2001:4860::8888");
  assert.equal(harness.calls.length, 1);
  assert.equal(harness.calls[0].url, SANDBOX + "/cdn-cgi/trace");
  assert.equal(harness.calls[0].options.credentials, "omit");
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

test("native Try it signs the exact Sandbox body with saved credentials and respects manual headers", { timeout: 5000 }, async () => {
  const endpoint = "/v3/onboarding/managed_accounts/list";
  const user = { ak: "ak_user_doc_test", sk: "sk_user_doc_test" };
  const account = { ak: "ak_acct_doc_test", sk: "sk_acct_doc_test" };
  const window = { __pgsDocsCreds: { env: "sandbox", user, account } };
  const dialog = { isConnected: true, querySelector: () => ({ textContent: endpoint }) };
  const document = { baseURI: "https://docs.example.test/", querySelector: () => dialog };

  class Xhr {
    static OPENED = 1;
    constructor() {
      this.sent = new Promise(resolve => { this.resolveSend = resolve; });
    }
    open() { this.readyState = Xhr.OPENED; this.headers = new Map(); }
    setRequestHeader(name, value) { this.headers.set(name.toLowerCase(), value); }
    send(body) { this.resolveSend({ body, headers: this.headers }); }
    abort() { this.readyState = 0; }
  }
  vm.runInNewContext(fs.readFileSync(path.join(root, "sandbox-playground-auth.js"), "utf8"), {
    window, document, XMLHttpRequest: Xhr, crypto: webcrypto, TextEncoder, Uint8Array, URL, DOMException,
  });
  const body = '{ "page": {"page": 1, "page_size": 20} }';
  const request = (url, headers = {}) => {
    const xhr = new Xhr();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.send(body);
    return xhr.sent;
  };

  const first = await request(SANDBOX + endpoint);
  const second = await request(SANDBOX + endpoint);
  assert.equal(first.body, body);
  assert.equal(first.headers.get("x-client-id"), user.ak);
  assert.notEqual(first.headers.get("x-nonce"), second.headers.get("x-nonce"));
  const hash = createHash("sha256").update(body).digest("hex");
  const timestamp = first.headers.get("x-timestamp");
  const nonce = first.headers.get("x-nonce");
  const canonical = ["content-type:application/json", `x-client-id:${user.ak}`, `x-content-hash:${hash}`, `x-nonce:${nonce}`, `x-timestamp:${timestamp}`].join("\n");
  const input = ["POST", endpoint, "", canonical, hash, timestamp, nonce].join("\n");
  assert.equal(first.headers.get("x-content-hash"), hash);
  assert.equal(first.headers.get("x-signature"), createHmac("sha256", user.sk).update(input).digest("hex"));

  const manual = await request(SANDBOX + endpoint, { "X-Signature": "manual" });
  assert.equal(manual.headers.get("x-signature"), "manual");
  assert(!manual.headers.has("x-client-id"));
  for (const url of [PRODUCTION + endpoint, SANDBOX + "/v3/bank_account", SANDBOX + endpoint + "?a=1"]) {
    assert(!(await request(url)).headers.has("x-signature"));
  }
  document.querySelector = () => null;
  assert(!(await request(SANDBOX + endpoint)).headers.has("x-signature"));
});
