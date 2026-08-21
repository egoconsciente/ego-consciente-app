import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(repoRoot, "artifacts", "ego-consciente");
const srcRoot = path.join(appRoot, "src");

async function read(relativePath) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(absolutePath)));
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

test("root quality scripts remain available", async () => {
  const packageJson = JSON.parse(await read("package.json"));

  assert.equal(packageJson.packageManager, "pnpm@10.26.1");
  assert.ok(packageJson.scripts?.test, "missing root test script");
  assert.ok(packageJson.scripts?.typecheck, "missing root typecheck script");
  assert.ok(packageJson.scripts?.build, "missing root build script");
});

test("critical route contract remains present and guarded", async () => {
  const appSource = await read("artifacts/ego-consciente/src/App.tsx");
  const routes = [
    "/",
    "/login",
    "/register",
    "/onboarding",
    "/auth/callback",
    "/ego-intro",
    "/portal",
    "/dashboard",
    "/chat",
    "/reflection",
    "/progress",
    "/journey",
    "/journey/:stageNumber",
  ];

  for (const route of routes) {
    assert.ok(appSource.includes(`path="${route}"`), `missing route ${route}`);
  }

  for (const route of ["/chat", "/reflection", "/progress", "/journey"]) {
    const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      appSource,
      new RegExp(`<Route path="${escaped}"><ProcessRoute`),
      `${route} must remain behind ProcessRoute`,
    );
  }

  assert.match(
    appSource,
    /<Route path="\/dashboard"><DashboardRoute/,
    "/dashboard must remain behind DashboardRoute",
  );

  assert.match(
    appSource,
    /<Route path="\/journey\/:stageNumber">[^\n]*<ProcessRoute/,
    "/journey/:stageNumber must remain behind ProcessRoute",
  );
});

test("the journey keeps exactly 40 contiguous stages", async () => {
  const stagesSource = await read("artifacts/ego-consciente/src/lib/stages.ts");
  const stageNumbers = [...stagesSource.matchAll(/\bstageNumber:\s*(\d+),/g)].map(
    (match) => Number(match[1]),
  );

  assert.equal(stageNumbers.length, 40, "expected exactly 40 stage definitions");
  assert.deepEqual(
    stageNumbers,
    Array.from({ length: 40 }, (_, index) => index + 1),
    "stage numbers must remain unique, ordered and contiguous",
  );
  assert.match(stagesSource, /export const TOTAL_STAGES = 40;/);
});

test("application code does not write raw browser console diagnostics", async () => {
  const sourceFiles = await collectSourceFiles(srcRoot);
  const observabilityFile = path.join(srcRoot, "lib", "client-observability.ts");
  const directConsolePattern = /console\.(?:log|debug|info|warn|error)\s*\(/;
  const violations = [];

  for (const file of sourceFiles) {
    if (file === observabilityFile) continue;
    const source = await readFile(file, "utf8");
    if (directConsolePattern.test(source)) {
      violations.push(path.relative(repoRoot, file));
    }
  }

  assert.deepEqual(
    violations,
    [],
    `direct console usage must go through client-observability: ${violations.join(", ")}`,
  );
});

test("user-facing errors never direct people to inspect the browser console", async () => {
  const sourceFiles = await collectSourceFiles(srcRoot);
  const violations = [];

  for (const file of sourceFiles) {
    const source = await readFile(file, "utf8");
    if (/revisa (?:la|el) consola/i.test(source)) {
      violations.push(path.relative(repoRoot, file));
    }
  }

  assert.deepEqual(violations, []);
});
