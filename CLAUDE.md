<!-- baron:template-only:start -->
> **Estás en `pf2e-module-template`, la plantilla, no en un módulo.** Los `__ALGO__` son placeholders a propósito: no los reemplaces a mano, los reemplaza `tools/init-module.mjs` en cada repo creado desde aquí. Los workflows no corren en este repo (`if: github.repository != ...`). Este bloque desaparece al inicializar.
<!-- baron:template-only:end -->
# __TITLE__ (`__MODULE_ID__`): reglas para sesiones de Claude

Módulo de Foundry VTT (v13–v14) para el sistema PF2e, de la familia BaronHVC. Comparte código con los demás módulos a través de una copia vendorizada de `pf2e-baron-core`, no de un módulo de Foundry aparte.

## Identidad del módulo

- Id / scope de flags / namespace de ajustes / prefijo de idioma: `__MODULE_ID__` (`MODULE_ID` en `scripts/main.js`).
- Prefijo CSS y de clases: `__PREFIX__` (raíz de las ventanas: `.__PREFIX__-app`; botón de cabecera: `.__PREFIX__-open`).
- Modo y configuración de CI: `baron.json`.

## Reglas de la familia

1. **Nunca edites `scripts/baron-core.js` ni `baron-core.lock.json` a mano.** Los escribe `node ../pf2e-baron-core/tools/sync-core.mjs . --ref <tag|sha>`; un cambio a mano rompe el hash del lock y `check-module` falla. Si el núcleo necesita un cambio, se hace en `pf2e-baron-core` y se resincroniza.
2. **Los identificadores persistidos están congelados.** Todo lo que queda guardado en mundos ajenos (el scope de flags `__MODULE_ID__`, claves de ajustes, slugs y labels de reglas, roll options, claves de idioma que se guardan en datos de ítems) no se renombra ni se borra jamás. Cada uno se lista en `baron.json` → `persisted` (la plantilla ya trae `__MODULE_ID__` y `gmOnly`); check-module falla si deja de aparecer en `scripts/` como literal completo (`"gmOnly"`) o como el texto antes del primer `${}` de una plantilla (`` `slug-p-${i}` `` cuenta para `slug-p-`). Si agregas uno nuevo, agrégalo ahí en el mismo commit.
3. **Nunca importes desde la carpeta de otro módulo** (ni `../otro-modulo/...` ni rutas absolutas `/modules/...`). The Forge sirve los módulos desde rutas versionadas y el import carga una segunda copia distinta. Lo compartido va en baron-core.
4. **baron-core no registra nada.** Los hooks, ajustes, helpers de Handlebars y sockets se registran solo en los archivos de entrada del módulo (`scripts/main.js` y los que estén en `esmodules`).
5. **Los handlers que escriben documentos desde un hook que reciben todos los clientes empiezan con `if (!isSoleExecutor()) return;`**: `createX`/`updateX`/`deleteX`, turnos de combate, mensajes de chat. Si no, cada cliente conectado repite la escritura. **Nunca** lo pongas en `preCreateX`/`preUpdateX`/`preDeleteX` ni en handlers de la interfaz: corren solo en el cliente que inició la acción, y el guardia los apagaría en silencio para los jugadores y para cualquier GM que no sea el activo.
6. **Nunca `getFlag`/`setFlag`/`unsetFlag` con el scope de otro módulo**: lanzan un error si ese módulo está inactivo. Para leer datos ajenos: `doc.flags?.[scope]?.[key]`.
7. **Corre `check-module` antes de cada etiqueta**: `node ../pf2e-baron-core/tools/check-module.mjs . --core-repo ../pf2e-baron-core --online`.
8. **Los arreglos de comportamiento salen en su propio release**, nunca mezclados con funciones nuevas, y el CHANGELOG anota la versión de baron-core de cada release.
9. **Idioma:** toda clave lleva el prefijo `__MODULE_ID__.` (es el id del módulo); `lang/en.json` y `lang/es.json` tienen exactamente las mismas claves. Usa claves literales (`i18n("Open")`, `"__MODULE_ID__.SettingGmOnly"`) para que check-module las verifique; las frases con variables usan `game.i18n.format` con `{marcadores}`. Los textos de PF2e se leen en vivo de `CONFIG.PF2E`, no se copian a los archivos de idioma.
10. **CSS acotado:** cada regla vive bajo `.__PREFIX__-app` o una clase `__PREFIX__-*` explícita. Nunca reestilices selectores globales de Foundry o PF2e ni declares variables en `:root`; los colores salen de las variables de tema de Foundry.
11. **Helpers de Handlebars con prefijo** (`__PREFIX__Eq`, no `eq`): son globales y gana el último que se registra.
12. **API pública** en `init` con `mod.api = Object.assign(mod.api ?? {}, {...})`, con `version` y `coreVersion` siempre. Otro módulo la lee desde su `setup` o `ready`, nunca desde su `init` (si carga antes, todavía no existe).
13. **Versiones:** las pone la etiqueta del release; no edites a mano `version`, `manifest` ni `download` de `module.json`. Nunca agregues `"protected"` ni un `requires` de `pf2e-baron-core` a `module.json`.

## Estilo

- Comentarios de código en inglés, cortos, explicando el **porqué**.
- README, CHANGELOG, NOTICE y comentarios de los workflows en español.
- Avisos legales: `NOTICE.md`. No copies texto, arte ni íconos de los compendios de PF2e al módulo.
