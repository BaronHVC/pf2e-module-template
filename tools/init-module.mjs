// One-shot initializer for a repository created from pf2e-module-template.
// It fills the placeholders, keeps only the NOTICE block that matches the
// Paizo license, writes the LICENSE that matches the mode (MIT for a public
// module, all rights reserved for a protected one), strips the template-only
// notes and then deletes itself, so a module can never be initialized twice
// with two identities.
//
//   node tools/init-module.mjs --id <id> --title <title> --description <text>
//     --author <name> --prefix <prefix> --mode public|protected [--paizo cup|orc]
//     [--requires <module-id>]
//
// Mode and Paizo license are separate axes because the license follows the
// whole project, not the price of each package: the free base of a freemium
// pair is public yet must use ORC, since the Community Use Policy forbids any
// paywall anywhere in the project.
//
// --requires names the one module this one cannot work without, typically the
// free base of a paid add-on; it lands in module.json relationships.requires.
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

const FLAGS = ["id", "title", "description", "author", "prefix", "mode", "paizo", "requires"];
// --paizo has a default that depends on --mode; --requires defaults to no
// module dependency at all.
const OPTIONAL = new Set(["paizo", "requires"]);
// The id pattern that --id and --requires share.
const MODULE_ID_RE = /^[a-z0-9-]+$/;
const MODES = ["public", "protected"];
const PAIZO = ["cup", "orc"];
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

// The template's own LICENSE is MIT, and so is every public module (a freemium
// base included, whatever its Paizo license): only its copyright line changes.
// A protected (paid) module gets this text instead. Its vendored baron-core.js
// stays MIT even inside a paid zip, so the text says so.
function paidLicense(author, year) {
  return `Copyright (c) ${year} ${author}. All rights reserved.

This module is made available to its supporters through Foundry VTT's
protected content system. You may install it and use it in your own Foundry
VTT games. You may not copy, share, redistribute, resell or publish its files,
in whole or in part, or works derived from them, without written permission
from the copyright holder.

Exception: scripts/baron-core.js is part of pf2e-baron-core and is licensed
under the MIT License (https://github.com/BaronHVC/pf2e-baron-core). That
license, not this one, applies to that file.

The Pathfinder material this module uses is covered by the notices in
NOTICE.md.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function licenseFor(opts, year) {
  if (opts.mode === "protected") return paidLicense(opts.author, year);
  let mit;
  try {
    mit = fs.readFileSync(path.join(ROOT, "LICENSE"), "utf8");
  } catch {
    fail("falta LICENSE; restauralo desde la plantilla");
  }
  const holder = /^Copyright \(c\) .*$/m;
  if (!mit.startsWith("MIT License") || !holder.test(mit)) fail("LICENSE ya no es la MIT de la plantilla; restauralo desde la plantilla");
  return mit.replace(holder, `Copyright (c) ${year} ${opts.author}`);
}

const USAGE = `Uso:
  node tools/init-module.mjs --id <id> --title <titulo> --description <texto>
    --author <autor> --prefix <prefijo> --mode public|protected [--paizo cup|orc]
    [--requires <id-de-modulo>]

  --id           id del modulo: minusculas, digitos y guiones (pf2e-baron-shop)
  --title        titulo visible (Baron's Shop)
  --description  descripcion corta para module.json y el README
  --author       autor para module.json y los avisos legales
  --prefix       prefijo CSS/clases: empieza con letra, 2-12 letras o digitos (bshop)
  --mode         como se distribuye: public (repo publico, codigo MIT)
                 | protected (repo privado, paquete protegido de pago, todos los derechos reservados)
  --paizo        licencia de Paizo para el material del juego (elige el bloque de NOTICE.md):
                 cup (Community Use Policy) | orc (ORC License).
                 Opcional: cup con --mode public, orc con --mode protected.
                 protected + cup no se permite: la CUP prohibe cualquier muro de pago.
                 La base gratuita de un freemium usa --mode public --paizo orc.
  --requires     opcional, una sola vez: id del modulo sin el que este no funciona (mismas reglas que --id).
                 Va a relationships.requires de module.json. Un complemento de pago (--mode protected)
                 lleva aqui su base gratuita: --requires baron-shop. Nunca pf2e-baron-core: va vendorizado.`;

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
  const missing = FLAGS.filter((f) => !OPTIONAL.has(f) && !opts[f]);
  if (missing.length) fail(`faltan: ${missing.map((f) => "--" + f).join(", ")}\n\n${USAGE}`);
  if (!MODULE_ID_RE.test(opts.id)) fail(`--id invalido "${opts.id}": solo minusculas, digitos y guiones`);
  if (opts.id === "pf2e-module-template") fail("--id no puede ser el de la plantilla");
  // Checked against undefined like --paizo: an empty --requires= is a typo.
  if (opts.requires !== undefined) {
    const req = opts.requires;
    if (!MODULE_ID_RE.test(req)) fail(`--requires invalido "${req}": solo minusculas, digitos y guiones`);
    if (req === "pf2e-baron-core") {
      fail("--requires no puede ser pf2e-baron-core: el nucleo va vendorizado en scripts/baron-core.js, nunca como dependencia de Foundry");
    }
    if (req === "pf2e-module-template") fail("--requires no puede ser el de la plantilla");
    if (req === "pf2e") fail("--requires pf2e no: pf2e es el sistema y ya va en relationships.systems");
    if (req === opts.id) fail("--requires no puede ser el mismo --id");
  }
  if (!/^[a-z][a-z0-9]{1,11}$/.test(opts.prefix)) {
    fail(`--prefix invalido "${opts.prefix}": empieza con letra y lleva de 2 a 12 minusculas o digitos`);
  }
  if (!MODES.includes(opts.mode)) fail(`--mode invalido "${opts.mode}": public o protected`);
  // Checked against undefined, not falsy: an explicit empty --paizo= is a
  // typo to report, not a request for the default.
  if (opts.paizo === undefined) opts.paizo = opts.mode === "protected" ? "orc" : "cup";
  if (!PAIZO.includes(opts.paizo)) fail(`--paizo invalido "${opts.paizo}": cup u orc`);
  if (opts.mode === "protected" && opts.paizo === "cup") {
    fail(
      "--mode protected no puede ir con --paizo cup: la Community Use Policy de Paizo prohibe cobrar o poner " +
        "cualquier parte del proyecto detras de un muro de pago. Un paquete de pago va con --paizo orc " +
        "(y su base gratuita tambien, con --mode public --paizo orc)."
    );
  }
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

// Keeps the body of the notice block for this Paizo license and removes the
// other one entirely, markers included: a module under one license must not
// also claim the other. The block follows --paizo, never --mode, because a
// free freemium base still needs the ORC notices.
function pickNotice(text, paizo) {
  const block = (name) =>
    new RegExp(`<!-- baron:notice-${name}:start -->[ \\t]*\\r?\\n([\\s\\S]*?)<!-- baron:notice-${name}:end -->[ \\t]*\\r?\\n?`);
  const keep = paizo;
  const drop = PAIZO.find((p) => p !== paizo);
  if (!block(keep).test(text) || !block(drop).test(text)) {
    fail("NOTICE.md no tiene los bloques baron:notice-cup y baron:notice-orc; restauralo desde la plantilla");
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
// Not an error: a standalone paid module is possible, but the family's paid
// packages are freemium add-ons that only work with their free base.
if (opts.mode === "protected" && opts.requires === undefined) {
  warnings.push("--mode protected sin --requires: un complemento de pago de un freemium tiene que requerir su base gratuita. Agregala a relationships.requires de module.json: { \"id\": \"<id-de-la-base>\", \"type\": \"module\", \"compatibility\": {} }.");
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
    if (rel === "NOTICE.md") text = pickNotice(text, opts.paizo);
    if (text !== before) text = tidyMarkdown(text);
  }
  text = fill(text, ext, opts);
  if (rel === "baron.json") {
    const config = JSON.parse(stripBom(text));
    config.mode = opts.mode;
    config.paizo = opts.paizo;
    // Left empty on purpose: only the author knows the page, and check-module
    // fails a protected module until it is filled.
    if (typeof config.landingUrl !== "string") config.landingUrl = "";
    // A paid module never publishes the dev channel (module-release ignores
    // the flag and says so on every release), so it should not claim one.
    if (opts.mode === "protected") config.devChannel = false;
    text = JSON.stringify(config, null, 2) + "\n";
  }
  // Rewritten only when asked, so a module without --requires keeps the
  // template's module.json byte for byte.
  if (rel === "module.json" && opts.requires !== undefined) {
    const mod = JSON.parse(stripBom(text));
    mod.relationships = {
      ...mod.relationships,
      requires: [{ id: opts.requires, type: "module", compatibility: {} }]
    };
    text = JSON.stringify(mod, null, 2) + "\n";
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
// LICENSE has no extension, so the loop above never reads it.
writes.set("LICENSE", licenseFor(opts, new Date().getFullYear()));

for (const [rel, text] of writes) fs.writeFileSync(path.join(ROOT, rel), text, "utf8");
fs.unlinkSync(SELF);

const { id, prefix, mode, paizo } = opts;
const lines = [
  ...warnings.map((w) => `AVISO: ${w}`),
  ...(warnings.length ? [""] : []),
  "init-module: listo.",
  `  id:       ${id}`,
  `  titulo:   ${opts.title}`,
  `  prefijo:  ${prefix} (.${prefix}-app, .${prefix}-open)`,
  `  modo:     ${mode} (${mode === "public" ? "repo publico, release normal" : "repo privado, paquete protegido de pago"}; baron.json "mode")`,
  `  paizo:    ${paizo} (${paizo === "cup" ? "aviso de la Community Use Policy" : "avisos de la ORC License"} en NOTICE.md; baron.json "paizo")`,
  `  licencia: ${mode === "public" ? "MIT" : "todos los derechos reservados (baron-core.js sigue MIT)"}, a nombre de ${opts.author}`,
  `  requiere: ${opts.requires ?? "ningun modulo"} (module.json relationships.requires)`,
  `  archivos actualizados: ${writes.size}`,
  "  tools/init-module.mjs se borro a si mismo.",
  ""
];
// The inherited README says the module needs nothing else installed, which a
// module that requires another contradicts.
const readmeFix = "corrige en el README el resumen en ingles (\"it does not need any other module installed\") y la linea \"Requiere\".";
if (mode === "protected") {
  lines.push(
    "Modo protected:",
    "  - El repo tiene que ser PRIVADO.",
    "  - baron.json queda con \"devChannel\": false: un modulo de pago nunca publica el canal de pruebas dev.",
    // The private repo URL must never reach the published manifest, so the
    // protected build takes "url" from here and refuses to run without it.
    "  - Llena \"landingUrl\" en baron.json antes del primer release: una URL https publica del modulo, como",
    `    https://foundryvtt.com/packages/${id} o tu pagina de Patreon. El manifiesto protegido la usa como "url",`,
    "    porque la del repo privado no puede publicarse. check-module (regla [m], posterior a v1.0.0) falla mientras este vacia.",
    "  - El release protegido lo arma module-release.yml de un baron-core posterior a v1.0.0 (resincroniza con sync-core;",
    "    con v1.0.0 falla a proposito). Subir el ZIP a foundryvtt.com y elegir los niveles de Patreon es a mano:",
    "    ver \"Publicar\" en el README.",
    "  - Corrige en el README la seccion \"Instalacion\": un paquete protegido no se instala con las URLs de GitHub.",
    ...(opts.requires === undefined ? [`  - Cuando agregues la base a relationships.requires, ${readmeFix}`] : []),
    ""
  );
}
if (opts.requires !== undefined) {
  lines.push(`Requiere ${opts.requires}:`, `  - module.json ya lo lista en relationships.requires; ${readmeFix}`, "");
}
if (paizo === "orc") {
  lines.push(
    "Paizo orc:",
    "  - Rellena los corchetes de NOTICE.md (obras ORC usadas, Reserved Material) antes de publicar."
  );
  // The CUP lets a free project use Paizo's trademarks; the ORC never licenses
  // them, free or paid, and the id cannot be renamed later. Same list as
  // PAIZO_TRADEMARK_RE in pf2e-baron-core's check-module: keep them in sync.
  if (/pf2|sf2e|pathfinder|starfinder|golarion|paizo/i.test(`${id} ${opts.title}`)) {
    lines.push("  - El id o el titulo nombran a Paizo o uno de sus juegos (PF2e, Pathfinder, Starfinder, Golarion): la ORC nunca licencia marcas de Paizo, es una pregunta legal abierta y el id es para siempre (ver NOTICE.md).");
  }
  lines.push("");
}
// Same rule as REGISTRY.md: a public module registers before any code is
// written, a protected one only when it is published (the core repo is
// public).
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
  // Foundry refuses to enable a module whose requires are not installed.
  opts.requires === undefined
    ? "  2. Activa el modulo en un mundo con PF2e."
    : `  2. Instala ${opts.requires} y activa los dos modulos en un mundo con PF2e.`,
  mode === "protected"
    ? "  3. node ../pf2e-baron-core/tools/check-module.mjs .   (con \"landingUrl\" ya lleno en baron.json)"
    : "  3. node ../pf2e-baron-core/tools/check-module.mjs .",
  "  4. git add -A",
  `     git commit -m "Initialize ${id} from pf2e-module-template"`,
  "     git push"
);
console.log(lines.join("\n"));
