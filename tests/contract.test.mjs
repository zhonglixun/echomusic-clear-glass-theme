import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const manifest = JSON.parse(
  await readFile(new URL("../manifest.json", import.meta.url), "utf8"),
);
const source = JSON.parse(
  await readFile(new URL("../echo-plugins.json", import.meta.url), "utf8"),
);
const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

const mockVue = {
  defineComponent: (value) => value,
  h: (...args) => args,
  ref: (value) => ({ value }),
  nextTick: () => {},
  onMounted: () => {},
  onBeforeUnmount: () => {},
  watch: () => {},
};

test("manifest and plugin source are consistent", () => {
  assert.equal(manifest.id, "clear-glass-theme");
  assert.equal(manifest.capabilities?.theme, true);
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  const entry = source.plugins.find((plugin) => plugin.id === manifest.id);
  assert.ok(entry, "echo-plugins.json is missing this plugin");
  assert.equal(entry.path, "");
  assert.equal(entry.repo, "https://github.com/zhonglixun/echomusic-clear-glass-theme");
});

test("plugin files required by the manifest exist", async () => {
  for (const file of [manifest.main ?? "index.js", manifest.style, manifest.icon]) {
    if (file) await access(new URL(`../${file}`, import.meta.url));
  }
});

test("registers exactly the two public themes", async () => {
  const plugin = await import("../index.js");
  const registrations = [];
  plugin.activate({
    vue: mockVue,
    theme: {
      register(value) {
        registrations.push(value);
      },
    },
  });

  assert.deepEqual(
    registrations.map((theme) => theme.id),
    ["qinglan-mint", "qinglan-sky"],
  );
  for (const theme of registrations) {
    assert.ok(theme.variants.light);
    assert.ok(theme.variants.dark);
    assert.equal(theme.settings.validate(theme.settings.defaults), true);
  }
});

test("shortcut palette keeps nine unique functional colors", () => {
  const keys = [
    "home",
    "explore",
    "free-listen",
    "discover-flow",
    "personal-fm",
    "recommend",
    "ranking",
    "purchased",
    "listen-together",
  ];

  for (const selector of [
    "html.ql-theme-active[data-ql-tint='mint']",
    "html.ql-theme-active[data-ql-tint='sky']",
    "html.ql-theme-active.dark[data-ql-tint='mint']",
    "html.ql-theme-active.dark[data-ql-tint='sky']",
  ]) {
    const start = css.indexOf(`${selector} {`);
    assert.ok(start >= 0, `missing palette: ${selector}`);
    const end = css.indexOf("}", start);
    const block = css.slice(start, end);
    const colors = [...block.matchAll(/--ql-icon-([a-z-]+):\s*(#[0-9a-f]{6});/gi)];
    assert.equal(colors.length, 9, `${selector} must define nine colors`);
    assert.equal(
      new Set(colors.map((match) => match[2].toLowerCase())).size,
      9,
      `${selector} colors must be unique`,
    );
    assert.deepEqual(
      colors.map((match) => match[1]).sort(),
      [...keys].sort(),
    );
  }
});

test("critical CSS contracts remain active", () => {
  assert.match(css, /html\.ql-theme-active/);
  assert.match(css, /\.action-icon:not\(\.playback-action\)/);
  assert.match(css, /button\.action-icon\.playback-action\[aria-expanded='true'\]/);
  assert.match(css, /\.lyric-page-tool-btn/);
  assert.match(css, /border-radius:\s*50%\s*!important/);
});

