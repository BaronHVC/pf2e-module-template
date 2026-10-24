# Textos de trabajo escritos por IA

Regla 15 del [CLAUDE.md](../CLAUDE.md): durante el desarrollo, con `"humanText": "signed"` en `baron.json` y un `baron-core.lock.json` que fija un núcleo posterior a v1.4.0 (el primero cuya CI revisa las firmas), `lang/*.json` puede llevar textos de trabajo escritos por IA; sin las dos cosas, un texto nuevo lleva el marcador `TODO-HUMANO:`. Cada uno se anota aquí, con su intención, en el mismo commit que lo agrega o lo cambia. Antes de etiquetar, BaronHVC reescribe cada uno desde cero (retocar el texto de la IA no cumple la política de IA de Foundry, §4.1) y lo firma en su terminal con `node ../pf2e-baron-core/tools/sign-text.mjs . --sign`. Una vez firmado, su fila se borra. Mientras el lock fije v1.4.0 o uno anterior, la CI no bloquea los de esta tabla: reescríbelos y corre `check-module ... --release` desde tu clon del núcleo antes de etiquetar.

| archivo | clave | intención (qué debe comunicar y dónde aparece) |
|---------|-------|------------------------------------------------|
| `lang/en.json`, `lang/es.json` | `__MODULE_ID__.Open` | viene de la plantilla: etiqueta del botón de la cabecera de la hoja que abre la ventana del módulo |
| `lang/en.json`, `lang/es.json` | `__MODULE_ID__.SettingGmOnly` | viene de la plantilla: nombre del ajuste que deja usar el módulo solo al GM |
| `lang/en.json`, `lang/es.json` | `__MODULE_ID__.SettingGmOnlyHint` | viene de la plantilla: ayuda de ese ajuste; desactivado, los jugadores dueños de un objeto también pueden usar el módulo en él |
