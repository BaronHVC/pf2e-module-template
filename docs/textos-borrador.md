# Textos de trabajo escritos por IA

Regla 15 del [CLAUDE.md](../CLAUDE.md): durante el desarrollo, con `"humanText": "signed"` en `baron.json`, `lang/*.json` puede llevar textos de trabajo escritos por IA. Cada uno se anota aquí, con su intención, en el mismo commit que lo agrega o lo cambia. Antes de etiquetar, BaronHVC reescribe cada uno desde cero (retocar el texto de la IA no cumple la política de IA de Foundry, §4.1) y lo firma en su terminal con `node ../pf2e-baron-core/tools/sign-text.mjs . --sign`. Una vez firmado, su fila se borra.

| archivo | clave | intención (qué debe comunicar y dónde aparece) |
|---------|-------|------------------------------------------------|
| `lang/en.json`, `lang/es.json` | `__MODULE_ID__.Open` | viene de la plantilla: etiqueta del botón de la cabecera de la hoja que abre la ventana del módulo |
| `lang/en.json`, `lang/es.json` | `__MODULE_ID__.SettingGmOnly` | viene de la plantilla: nombre del ajuste que deja usar el módulo solo al GM |
| `lang/en.json`, `lang/es.json` | `__MODULE_ID__.SettingGmOnlyHint` | viene de la plantilla: ayuda de ese ajuste; desactivado, los jugadores dueños de un objeto también pueden usar el módulo en él |
