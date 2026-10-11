// Entry point. baron-core registers nothing when imported, so every hook,
// setting and helper this module needs is wired here, in an entry file;
// whatever is not wired up here simply never happens.
// isSoleExecutor and injectSheetButton are imported for the commented examples
// at the bottom: drop whatever the module ends up not using.
import { CORE_VERSION, createI18n, makeCanEdit, isSoleExecutor, injectSheetButton } from "./baron-core.js";

// MODULE_ID is the manifest id, the flag scope, the settings namespace and the
// i18n prefix, all at once and forever: renaming it orphans every flag and
// setting already saved in users' worlds. baron.json lists it (and the setting
// key "gmOnly") under "persisted", so check-module fails once that exact
// string literal is gone from scripts/.
export const MODULE_ID = "__MODULE_ID__";
export const i18n = createI18n(MODULE_ID);
export const canEdit = makeCanEdit(MODULE_ID);

/*
 * Family rules (the full list lives in CLAUDE.md):
 * - scripts/baron-core.js and baron-core.lock.json are written only by
 *   sync-core. A hand edit breaks the lock hash and check-module fails.
 * - Never import from another module's folder: The Forge serves modules from
 *   versioned paths, so a cross-module import loads a second, different copy.
 * - A handler that writes documents from a hook every client receives
 *   (createX/updateX/deleteX, combat turns, chat messages) returns early
 *   unless isSoleExecutor(), otherwise each connected client repeats the
 *   write. Never gate preCreate/preUpdate/preDelete or UI handlers: they run
 *   only on the client that started the action.
 * - Never getFlag/setFlag with another module's scope (it throws while that
 *   module is inactive); read doc.flags?.[scope]?.[key] instead.
 * - Every CSS rule lives under .__PREFIX__-app or an explicit __PREFIX__-*
 *   class, and Handlebars helpers (global, last registration wins) are
 *   prefixed, e.g. __PREFIX__Eq.
 */

Hooks.once("init", () => {
  // canEdit reads this setting every time it is called, so it has to exist
  // before the first sheet renders: init is the earliest safe point. The keys
  // are literal, not built from MODULE_ID, so check-module can verify them
  // against lang/en.json.
  game.settings.register(MODULE_ID, "gmOnly", {
    name: "__MODULE_ID__.SettingGmOnly",
    hint: "__MODULE_ID__.SettingGmOnlyHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Macros and other modules reach this one through game.modules.get(id).api.
  // Attached in init, which needs no world data, so a module that loaded
  // earlier can already read it from its own setup or ready. Object.assign
  // keeps whatever was attached before. coreVersion is what bug reports ask
  // for: F12, game.modules.get("<id>").api.coreVersion.
  const mod = game.modules.get(MODULE_ID);
  mod.api = Object.assign(mod.api ?? {}, { version: mod.version, coreVersion: CORE_VERSION });
});

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | ready`);
});

// Example: a button in the header of item sheets. PF2e renders its own sheet
// classes and Foundry fires a render hook per class in the chain, so both
// hooks are wired (as pf2e-simple-weapon-editor does) and the key keeps the
// button from being added twice in the same render.
//
// function addOpenButton(sheet) {
//   injectSheetButton(sheet, {
//     key: `${MODULE_ID}:example`,
//     match: (item) => item.type === "weapon",
//     canShow: canEdit,
//     cssClass: "__PREFIX__-open",
//     icon: "fa-solid fa-wand-magic-sparkles",
//     label: () => i18n("Open"),
//     title: () => i18n("Title"),
//     onClick: (item) => ui.notifications.info(item.name),
//     logPrefix: `${MODULE_ID} | header button`
//   });
// }
// Hooks.on("renderItemSheet", addOpenButton);
// Hooks.on("renderItemSheetPF2e", addOpenButton);

// Example: a hook that writes documents. Every connected client receives
// createChatMessage, so without the guard each client would apply the same
// change. A preCreateChatMessage handler would run only on the sender's client
// and must not be gated.
//
// Hooks.on("createChatMessage", async (message) => {
//   if (!isSoleExecutor()) return;
//   // ...update documents here...
// });
