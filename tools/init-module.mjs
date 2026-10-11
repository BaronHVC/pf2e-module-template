// One-shot initializer for a repository created from pf2e-module-template.
// It fills the placeholders, keeps only the NOTICE block that matches the
// mode, strips the template-only notes and then deletes itself, so a module
// can never be initialized twice with two different identities.
//
//   node tools/init-module.mjs --id <id> --title <title> --description <text>
//     --author <name> --prefix <prefix> --mode public|protected
//
// Node built-ins only, so it runs right after cloning, with nothing installed.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.dirname(path.dirname(SELF));
// The family's namespace table, when the core repo is cloned next to this one
// (the layout the README asks for).
const REGISTRY = path.join(ROOT, "..", "pf2e-baron-core", "REGISTRY.md");

const FLAGS = ["id", "title", "description", "author", "prefix", "mode"];
const MODES = ["public", "protected"];
// Same pattern as check-module's leftover-placeholder rule, so whatever this
// script lets through would also fail CI.
const PLACEHOLDER = /__[A-Z][A-Z0-9_]*__/g;
const VALUE_OF = {
  MODULE_ID: "id",
  TITLE: "title",
  DESCRIPTION: "description",
  AUTHOR: "author",
  PREFIX: "prefix"
};
const TEXT_EXT = new Set([".json", ".js", ".mjs", ".css", ".hbs", ".html", ".md", ".yml", ".yaml", ".txt", ".ps1"]);
// In these formats every placeholder sits inside a double-quoted string, so
// the value is escaped as a JSON string body (also valid in YAML and JS): a
// title with a quote or a backslash must not break the file.
const QUOTED_EXT = new Set([".json", ".yml", ".yaml", ".js", ".mjs"]);
const SKIP_DIRS = new Set([".git", "node_modules", ".baron-core", "build", ".code-review-graph", "agents"]);
// Written only by sync-core: the lock hash must keep matching the vendored copy.
const SKIP_FILES = new Set(["scripts/baron-core.js", "baron-core.lock.json"]);
const TEMPLATE_ONLY = /<!-- baron:template-only:start -->[\s\S]*?<!-- baron:template-only:end -->[ \t]*\r?\n?/g;

const USAGE = `Uso:
  node tools/init-module.mjs --id <id> --title <titulo> --description <texto>
    --author <autor> --prefix <prefijo> --mode public|protected

  --id           id del modulo: minusculas, digitos y guiones (pf2e-baron-shop)
  --title        titulo visible (Baron's Shop)
  --description  descripcion corta para module.json y el README
  --author       autor para module.json y los avisos legales
  --prefix       prefijo CSS/clases: empieza con letra, 2-12 letras o digitos (bshop)
  --mode         public (gratis, Community Use Policy) | protected (de pago, ORC)`;

function fail(message) {
  console.error(`init-module: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") return { help: true };
    const match = /^--([a-z]+)(?:=([\s\S]*))?$/.exec(arg);
    if (!match) fail(`argumento no reconocido: ${arg}\n\n${USAGE}`);
    const [, key, inline] = match;
    if (!FLAGS.includes(key)) fail(`opcion desconocida: --${key}\n\n${USAGE}`);
    if (key in out) fail(`--${key} viene dos veces`);
    let value = inline;
    if (value === undefined) {
      value = argv[++i];
      // A missing value would otherwise swallow the next flag as the value.
      if (value === undefined || value.startsWith("--")) fail(`falta el valor de --${key} (usa --${key}=... si empieza con --)`);
    }
    out[key] = value.trim();
  }
  return out;
}

function validate(opts) {
  const missing = FLAGS.filter((f) => !opts[f]);
  if (missing.length) fail(`faltan: ${missing.map((f) => "--" + f).join(", ")}\n\n${USAGE}`);
  if (!/^[a-z0-9-]+$/.test(opts.id)) fail(`--id invalido "${opts.id}": solo minusculas, digitos y guiones`);
  if (opts.id === "pf2e-module-template") fail("--id no puede ser el de la plantilla");
  if (!/^[a-z][a-z0-9]{1,11}$/.test(opts.prefix)) {
    fail(`--prefix invalido "${opts.prefix}": empieza con letra y lleva de 2 a 12 minusculas o digitos`);
  }
  if (!MODES.includes(opts.mode)) fail(`--mode invalido "${opts.mode}": public o protected`);
  for (const key of ["title", "description", "author"]) {
    // A line break or a control character would break JSON, YAML and markdown
    // alike; a placeholder inside a value would never get filled.
    if (/[\u0000-\u001f\u007f]/.test(opts[key])) fail(`--${key} no puede tener saltos de linea ni caracteres de control`);
    if (new RegExp(PLACEHOLDER.source).test(opts[key])) fail(`--${key} no puede contener un placeholder (__ALGO__)`);
  }
}

// Reusing a registered id or prefix would make two modules share flags, CSS
// classes, rule slugs or Handlebars helpers in the same world. The new module
// claims its id (also its i18n prefix), "<prefix>-*" and "<prefix>X" helpers.
// Returns null when the registry is not there to compare with.
function registryClashes(opts) {
  if (!fs.existsSync(REGISTRY)) return null;
  const clashes = [];
  const words = (cell) => cell.split(/[\s,/]+/).filter((w) => w && !["ninguno", "none"].includes(w.toLowerCase()));
  for (const line of fs.readFileSync(REGISTRY, "utf8").split(/\r?\n/)) {
    if (!line.startsWith("|") || /^\|\s*-/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.replace(/`/g, "").trim());
    if (cells.length < 7 || cells[0].startsWith("id ")) continue; // header row
    const [rowId, rowI18n] = cells;
    if (rowId.toLowerCase() === opts.id || rowI18n.toLowerCase() === opts.id) {
      clashes.push(`--id ${opts.id}: ya es el id o el prefijo i18n de ${rowId}`);
    }
    const p = opts.prefix;
    const taken = cells.slice(2, 6).flatMap(words).filter((w) => {
      const lower = w.toLowerCase();
      return lower === p || lower.startsWith(`${p}-`) || (w.startsWith(p) && /^[A-Z]/.test(w.slice(p.length)));
    });
    if (taken.length) clashes.push(`--prefix ${p}: choca con ${taken.join(", ")} de ${rowId}`);
  }
  return clashes;
}

// The origin remote's repository name, or null when this folder is not a git
// clone of its own (checked by .git so a parent repo is never consulted).
function originRepoName() {
  if (!fs.existsSync(path.join(ROOT, ".git"))) return null;
  try {
    const url = execFileSync("git", ["-C", ROOT, "remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true
    }).trim();
    return /([^/\\:]+?)(?:\.git)?[/\\]?$/.exec(url)?.[1] ?? null;
  } catch {
    return null;
  }
}

function listFiles(dir, rel = "") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...listFiles(path.join(dir, entry.name), relPath));
    } else if (entry.isFile() && TEXT_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push(relPath);
    }
  }
  return out;
}

// Keeps the body of the notice block for this mode and removes the other one
// entirely, markers included: a free module must not carry the paid notices
// and the other way around.
function pickNotice(text, mode) {
  const block = (name) =>
    new RegExp(`<!-- baron:notice-${name}:start -->[ \\t]*\\r?\\n([\\s\\S]*?)<!-- baron:notice-${name}:end -->[ \\t]*\\r?\\n?`);
  const keep = mode === "public" ? "free" : "paid";
  const drop = mode === "public" ? "paid" : "free";
  if (!block(keep).test(text) || !block(drop).test(text)) {
    fail("NOTICE.md no tiene los bloques baron:notice-free y baron:notice-paid; restauralo desde la plantilla");
  }
  return text.replace(block(drop), "").replace(block(keep), (_, body) => body);
}

// Removing blocks leaves runs of blank lines behind; markdown renders them
// the same, but the diff of the first commit should look intentional.
function tidyMarkdown(text) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  return text.replace(/(?:[ \t]*\r?\n){3,}/g, eol + eol).replace(/^(?:[ \t]*\r?\n)+/, "").replace(/\s*$/, eol);
}

function fill(text, ext, opts) {
  const quoted = QUOTED_EXT.has(ext);
  return text.replace(PLACEHOLDER, (token) => {
    const key = VALUE_OF[token.slice(2, -2)];
    if (!key) return token;
    return quoted ? JSON.stringify(opts[key]).slice(1, -1) : opts[key];
  });
}

// Notepad saves JSON with a BOM, which JSON.parse rejects. Compared by char
// code so this file stays pure ASCII.
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

const opts = parseArgs(process.argv.slice(2));
if (opts.help) {
  console.log(USAGE);
  process.exit(0);
}
validate(opts);

if (path.basename(ROOT) === "pf2e-module-template") {
  fail("esto es la plantilla misma: corre el script en el repo creado con 'Use this template'");
}
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "module.json"), "utf8"));
} catch (err) {
  fail(`no pude leer module.json: ${err.message}`);
}
if (manifest.id !== "__MODULE_ID__") fail(`este repo ya esta inicializado (module.json id = "${manifest.id}")`);

const clashes = registryClashes(opts);
if (clashes?.length) {
  fail(`el id o el prefijo ya estan registrados en ${REGISTRY} (no se escribio nada):\n  ${clashes.join("\n  ")}`);
}
// The README, module.json url and the issue links are built from the id,
// while the release workflow uses the real repository name: they must match.
const warnings = [];
if (clashes === null) {
  warnings.push(`no encontre ${REGISTRY}: revisa a mano que el id y el prefijo no esten tomados por otro modulo de la familia.`);
}
const folder = path.basename(ROOT);
if (folder !== opts.id) {
  warnings.push(`la carpeta se llama "${folder}", no "${opts.id}": el repo de GitHub tiene que llamarse como el id, porque las URLs del README y de module.json apuntan a https://github.com/BaronHVC/${opts.id}.`);
}
const origin = originRepoName();
if (origin && origin !== opts.id) {
  warnings.push(`el remoto origin apunta al repo "${origin}", no a "${opts.id}": renombra el repo en GitHub o usa --id ${origin}.`);
}

// Everything is computed and checked in memory first: a bad template file
// aborts the run before a single file is written, so it can simply be rerun.
const writes = new Map();
const leftovers = [];
for (const rel of listFiles(ROOT)) {
  if (SKIP_FILES.has(rel)) continue;
  const abs = path.join(ROOT, rel);
  if (abs === SELF) continue;
  const ext = path.extname(rel).toLowerCase();
  const before = fs.readFileSync(abs, "utf8");
  let text = before;
  if (ext === ".md") {
    text = text.replace(TEMPLATE_ONLY, "");
    if (rel === "NOTICE.md") text = pickNotice(text, opts.mode);
    if (text !== before) text = tidyMarkdown(text);
  }
  text = fill(text, ext, opts);
  if (rel === "baron.json") {
    const config = JSON.parse(stripBom(text));
    config.mode = opts.mode;
    text = JSON.stringify(config, null, 2) + "\n";
  }
  if (ext === ".json") {
    try {
      JSON.parse(stripBom(text));
    } catch (err) {
      fail(`${rel} dejaria de ser JSON valido: ${err.message}`);
    }
  }
  const left = text.match(PLACEHOLDER);
  if (left) leftovers.push(`${rel}: ${[...new Set(left)].join(", ")}`);
  if (text !== before) writes.set(rel, text);
}
if (leftovers.length) fail(`quedarian placeholders sin reemplazar (no se escribio nada):\n  ${leftovers.join("\n  ")}`);
if (!fs.existsSync(path.join(ROOT, "NOTICE.md"))) fail("falta NOTICE.md; restauralo desde la plantilla");

for (const [rel, text] of writes) fs.writeFileSync(path.join(ROOT, rel), text, "utf8");
fs.unlinkSync(SELF);

const { id, prefix, mode } = opts;
const lines = [
  ...warnings.map((w) => `AVISO: ${w}`),
  ...(warnings.length ? [""] : []),
  "init-module: listo.",
  `  id:       ${id}`,
  `  titulo:   ${opts.title}`,
  `  prefijo:  ${prefix} (.${prefix}-app, .${prefix}-open)`,
  `  modo:     ${mode} (${mode === "public" ? "aviso de la Community Use Policy" : "avisos de la ORC License"} en NOTICE.md)`,
  `  archivos actualizados: ${writes.size}`,
  "  tools/init-module.mjs se borro a si mismo.",
  ""
];
if (mode === "protected") {
  lines.push(
    "Modo protected:",
    "  - El repo tiene que ser PRIVADO.",
    "  - El release protegido todavia no esta implementado: module-release.yml falla a proposito.",
    "  - Rellena los corchetes de NOTICE.md (obras ORC usadas, Reserved Material) antes de publicar."
  );
  if (/pf2e|pathfinder/i.test(`${id} ${opts.title}`)) {
    lines.push("  - El id o el titulo usan PF2e/Pathfinder: en un modulo de pago es una pregunta legal abierta (ver NOTICE.md).");
  }
  lines.push("");
}
// Same rule as REGISTRY.md: a free module registers before any code is
// written, a paid one only when it is published (the core repo is public).
lines.push(
  mode === "public"
    ? "Agrega ya esta fila a REGISTRY.md de pf2e-baron-core, antes de escribir codigo:"
    : "Fila para REGISTRY.md de pf2e-baron-core: agregala solo cuando el modulo se publique (ese repo es publico):",
  "",
  `| \`${id}\` | \`${id}\` | \`${prefix}-app\` / \`${prefix}-open\` | \`${prefix}-\` | \`${prefix}-\` | \`${prefix}\` | ninguno |`,
  "",
  // One command per line: Windows PowerShell 5.1 rejects "&&".
  "Siguientes pasos:",
  "  1. powershell -NoProfile -ExecutionPolicy Bypass -File tools/link-foundry.ps1",
  "  2. Activa el modulo en un mundo con PF2e.",
  "  3. node ../pf2e-baron-core/tools/check-module.mjs .",
  "  4. git add -A",
  `     git commit -m "Initialize ${id} from pf2e-module-template"`,
  "     git push"
);
console.log(lines.join("\n"));
