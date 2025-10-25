#!/usr/bin/env node

const { readFileSync } = require("fs");
const path = require("path");
const glob = require("glob");

const root = process.cwd();
const rootLockfile = path.join(root, "package-lock.json");

function fail(message, items = []) {
  console.error(`\n[policy-check] ${message}`);
  if (items.length) {
    for (const item of items) {
      console.error(`  - ${item}`);
    }
  }
  process.exit(1);
}

const lockfiles = glob.sync("**/{yarn.lock,pnpm-lock.yaml,package-lock.json}", {
  cwd: root,
  ignore: ["node_modules/**", "apps/web/.next/**", ".turbo/**"],
});

const extraLockfiles = lockfiles
  .map((file) => path.join(root, file))
  .filter((file) => path.resolve(file) !== path.resolve(rootLockfile));

if (extraLockfiles.length) {
  fail("Detected non-root lockfiles", extraLockfiles.map((file) => path.relative(root, file)));
}

const sources = glob.sync(
  [
    "apps/web/app/**/*.{ts,tsx}",
    "apps/web/components/**/*.{ts,tsx}",
    "apps/web/pages/**/*.{ts,tsx}",
  ],
  {
    cwd: root,
    ignore: ["**/*.d.ts", "**/node_modules/**"],
  },
);

const inlineViolations = [];
const scriptRegex = /<script\b/i;
const dangerousRegex = /dangerouslySetInnerHTML/;

for (const relativePath of sources) {
  const filePath = path.join(root, relativePath);
  const contents = readFileSync(filePath, "utf8");
  if (scriptRegex.test(contents) || dangerousRegex.test(contents)) {
    inlineViolations.push(relativePath);
  }
}

if (inlineViolations.length) {
  fail("Inline <script> tags or dangerouslySetInnerHTML detected", inlineViolations);
}

process.exit(0);
