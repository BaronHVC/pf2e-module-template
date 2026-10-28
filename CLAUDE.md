<!-- baron:template-only:start -->
> **Estás en `pf2e-module-template`, la plantilla, no en un módulo.** Los `__ALGO__` son placeholders a propósito: no los reemplaces a mano, los reemplaza `tools/init-module.mjs` en cada repo creado desde aquí. Los workflows no corren en este repo (`if: github.repository != ...`). Este bloque desaparece al inicializar.
<!-- baron:template-only:end -->
# __TITLE__ (`__MODULE_ID__`): reglas para sesiones de Claude

Módulo de Foundry VTT (v13–v14) para el sistema PF2e, de la familia BaronHVC. Comparte código con los demás módulos a través de una copia vendorizada de `pf2e-baron-core`, no de un módulo de Foundry aparte.

## Identidad del módulo

- Id / scope de flags / namespace de ajustes / prefijo de idioma: `__MODULE_ID__` (`MODULE_ID` en `scripts/main.js`).
- Prefijo CSS y de clases: `__PREFIX__` (raíz de las ventanas: `.__PREFIX__-app`; botón de cabecera: `.__PREFIX__-open`).
- `baron.json`: configuración de CI y dos ejes independientes. `mode` (`public` | `protected`) es cómo se distribuye y decide `LICENSE` (MIT | todos los derechos reservados). `paizo` (`cup` | `orc`) es la licencia de Paizo del material del juego y decide el bloque de `NOTICE.md`. `protected` + `cup` está prohibido: la Community Use Policy no admite ningún muro de pago en el proyecto. Si cambias `paizo`, reemplaza `NOTICE.md` entero en el mismo commit por el que escribe `tools/init-module.mjs` con el `--paizo` nuevo en un clon aparte de la plantilla (mismos id, título, descripción, autor y prefijo): nunca dejes los dos avisos. La revisión `[l]` de check-module revisa que coincidan; la CI la corre solo cuando `baron-core.lock.json` apunta a un núcleo que la trae (posterior a v1.0.0-rc.1). `landingUrl` es la URL `https` pública del módulo: vacía en uno `public`, obligatoria en uno `protected`, porque el manifiesto protegido la usa como `url` y el del repo privado no puede publicarse (revisión `[m]`, posterior a v1.0.0).

## Reglas de la familia

1. **Nunca edites `scripts/baron-core.js` ni `baron-core.lock.json` a mano.** Los escribe `node ../pf2e-baron-core/tools/sync-core.mjs . --ref <tag|sha>`; un cambio a mano rompe el hash del lock y `check-module` falla. Si el núcleo necesita un cambio, se hace en `pf2e-baron-core` y se resincroniza.
2. **Los identificadores persistidos están congelados.** Todo lo que queda guardado en mundos ajenos (el scope de flags `__MODULE_ID__`, claves de ajustes, slugs y labels de reglas, roll options, claves de idioma que se guardan en datos de ítems) no se renombra ni se borra jamás. Cada uno se lista en `baron.json` → `persisted` (la plantilla ya trae `__MODULE_ID__` y `gmOnly`); check-module falla si deja de aparecer en `scripts/` como literal completo (`"gmOnly"`) o como el texto antes del primer `${}` de una plantilla (`` `slug-p-${i}` `` cuenta para `slug-p-`). Si agregas uno nuevo, agrégalo ahí en el mismo commit.
3. **Nunca importes desde la carpeta de otro módulo** (ni `../otro-modulo/...` ni rutas absolutas `/modules/...`). The Forge sirve los módulos desde rutas versionadas y el import carga una segunda copia distinta. Lo compartido va en baron-core.
4. **baron-core no registra nada.** Los hooks, ajustes, helpers de Handlebars y sockets se registran solo en los archivos de entrada del módulo (`scripts/main.js` y los que estén en `esmodules`).
5. **Los handlers que escriben documentos desde un hook que reciben todos los clientes empiezan con `if (!isSoleExecutor()) return;`**: `createX`/`updateX`/`deleteX`, turnos de combate, mensajes de chat. Si no, cada cliente conectado repite la escritura. **Nunca** lo pongas en `preCreateX`/`preUpdateX`/`preDeleteX` ni en handlers de la interfaz: corren solo en el cliente que inició la acción, y el guardia los apagaría en silencio para los jugadores y para cualquier GM que no sea el activo.
6. **Nunca `getFlag`/`setFlag`/`unsetFlag` con el scope de otro módulo**: lanzan un error si ese módulo está inactivo. Para leer datos ajenos: `doc.flags?.[scope]?.[key]`.
7. **Corre `check-module` antes de cada etiqueta**: `node ../pf2e-baron-core/tools/check-module.mjs . --core-repo ../pf2e-baron-core --online --release` (lo mismo que la CI de la etiqueta: un `TODO-HUMANO:` pendiente falla aquí y no solo avisa; con un núcleo posterior a v1.2.0, también un corchete sin llenar o una línea `PENDIENTE:` en `NOTICE.md`, ver *Avisos legales*). Las pruebas de `test/*.test.mjs` corren en la CI en cada push y en cada release, y una roja no deja publicar (desde el núcleo v1.4.0): córrelas antes con `node --test test/*.test.mjs`.
8. **Los arreglos de comportamiento salen en su propio release**, nunca mezclados con funciones nuevas, y el CHANGELOG anota la versión de baron-core de cada release.
9. **Idioma:** toda clave lleva el prefijo `__MODULE_ID__.` (es el id del módulo); `lang/en.json` y `lang/es.json` tienen exactamente las mismas claves. Usa claves literales (`i18n("Open")`, `"__MODULE_ID__.SettingGmOnly"`) para que check-module las verifique; las frases con variables usan `game.i18n.format` con `{marcadores}`. Los textos de PF2e se leen en vivo de `CONFIG.PF2E`, no se copian a los archivos de idioma.
10. **CSS acotado:** cada regla vive bajo `.__PREFIX__-app` o una clase `__PREFIX__-*` explícita. Nunca reestilices selectores globales de Foundry o PF2e ni declares variables en `:root`; los colores salen de las variables de tema de Foundry.
11. **Helpers de Handlebars con prefijo** (`__PREFIX__Eq`, no `eq`): son globales y gana el último que se registra.
12. **API pública** en `init` con `mod.api = Object.assign(mod.api ?? {}, {...})`, con `version` y `coreVersion` siempre. Otro módulo la lee desde su `setup` o `ready`, nunca desde su `init` (si carga antes, todavía no existe).
13. **Versiones:** las pone la etiqueta del release; no edites a mano `version`, `manifest` ni `download` de `module.json`. Nunca agregues `"protected"` ni un `requires` de `pf2e-baron-core` a `module.json`.
14. **Envolver métodos internos de PF2e o Foundry** (de un prototipo o estáticos del sistema, como `game.pf2e.Check.roll`):
    - Si `globalThis.libWrapper` existe, usa `libWrapper.register(MODULE_ID, "<ruta>", fn, "WRAPPER")`. Otros módulos populares (Toolbelt, Visioner) envuelven los mismos métodos con lib-wrapper, y una asignación manual encima de un método que él administra puede volver a entrar a su despachador. Es una dependencia suave: no la declares en `relationships.requires`.
    - Si no existe, hazlo a mano: instala en el dueño real del método (sube por la cadena con `hasOwnProperty`), guarda el original, **llámalo siempre** (`orig.call(this, ...args)`) y marca el dueño con una bandera propia del módulo (`_<prefijo>Wrapped<Metodo>`) para no instalarlo dos veces.
    - Regístralo en `setup` o después, cuando el sistema y lib-wrapper ya cargaron. Nunca uses `"OVERRIDE"` ni un reemplazo que no llame al original.
    - Antes de envolver un método, revisa la columna «Envuelve» de `REGISTRY.md` en `pf2e-baron-core`: si otro módulo de la familia ya lo envuelve, coordínalo. Anota ahí cada método que envuelvas.
15. **Textos humanos (política de IA de Foundry, manual del publicador §4.1), en todos los módulos de la familia:** las etiquetas de la interfaz y el texto preparado (valores de `lang/*.json`, texto de chat, `title` y `description` de `module.json`, texto del listado) los escribe una persona. La IA solo puede corregir o dar formato a un texto humano, o traducirlo con la revisión de alguien que domine el idioma; un texto de IA que una persona retoca probablemente no cumple y hay que reescribirlo desde cero.
    - Un texto que nadie ha escrito todavía lleva el valor `TODO-HUMANO: <qué debe decir>`, en `en.json` y en `es.json` (para que la paridad de la regla 9 se mantenga). Ese marcador sigue valiendo.
    - Durante el desarrollo, `lang/*.json` puede llevar textos de trabajo escritos por IA, solo si `baron.json` dice `"humanText": "signed"` (el candado de abajo; los módulos nuevos lo traen) **y** `baron-core.lock.json` fija un núcleo posterior a v1.4.0, el primero cuya CI revisa las firmas: sin las dos cosas, un texto de IA olvidado se publicaría, así que va el marcador. Anota cada uno en `docs/textos-borrador.md` con su clave, dónde aparece y su intención (qué debe comunicar), más sus `{marcadores}` y un largo máximo si los tiene, en el formato que ese archivo describe, en el mismo commit que lo agrega o lo cambia.
    - Nunca corras `sign-text --sign` ni edites `human-text.json`: cada firma dice que BaronHVC escribió ese texto. Sí puedes correr `node ../pf2e-baron-core/tools/sign-text.mjs .`, sin `--sign`, para listar lo que falta firmar.
    - Antes de cada etiqueta, BaronHVC reescribe desde cero cada texto de trabajo y lo firma en su terminal con `node ../pf2e-baron-core/tools/sign-text.mjs . --sign`. Revisar o retocar el texto de la IA no cumple (§4.1). BaronHVC e IAR18 escriben los textos en la hoja de `text-sheet` del núcleo (posterior a v1.5.0): `node ../pf2e-baron-core/tools/text-sheet.mjs export` escribe `textos-hoja.csv` sin el texto de la IA, ellos la llenan en Excel o Google Sheets e `import textos-hoja.csv` los pasa a `lang/*.json`; tú puedes correr `export` e `import`, pero nunca llenes las columnas de idioma de la hoja.
    - Una traducción hecha con IA cuenta solo cuando la revisa, línea por línea contra su original humano, una persona que domina el idioma, y es esa persona quien la firma: en una traducción, su `s` dice «domino este idioma y revisé esta traducción», no «la escribí desde cero» (`sign-text --sign` lo explica antes de la primera pregunta).
    - El candado solo ve los `lang/*.json` que declara `module.json` (si no declara ninguno, todos) y el `title` y la `description`; un `lang/*.json` sin declarar viaja en el ZIP, así que también lo bloquea. No ve las etiquetas de compendios (`packs[].label`, `packFolders[].name`), el texto fijo de `templates/*.hbs` ni el texto de chat armado en `scripts/`: esos nunca los escribe la IA, ni como borrador.
    - Con `"humanText": "signed"` en `baron.json` (los módulos nuevos lo traen), la revisión `[n]` de check-module avisa en cada push de todo texto sin firma, cambiado después de firmarse, vacío o con `TODO-HUMANO:`, y de todo `lang/*.json` sin declarar, y con `--release` (regla 7) lo bloquea: la etiqueta no publica un texto sin firmar. Un `human-text.json` mal formado falla siempre. La CI revisa las firmas cuando `baron-core.lock.json` apunta a un núcleo que las trae (posterior a v1.4.0) y el marcador `TODO-HUMANO:` desde uno posterior a v1.1.1.
16. **Comprensión del código (política de IA de Foundry, §4.4):** BaronHVC debe poder entender, explicar, modificar y mantener todo el código que publica. Mantén al día:
    - `docs/ARCHITECTURE.md`: mapa de archivos, flujos con `archivo:línea` y quién los ejecuta, datos persistidos y puntos delicados. Actualiza las referencias en el mismo commit que mueve el código.
    - `docs/PREGUNTAS.md`: 15 a 30 preguntas técnicas con dónde mirar, **sin respuestas**.
    `docs/comprension/` es de BaronHVC: sus respuestas y notas, escritas y commiteadas por él. Ahí puedes señalar errores, pero nunca reescribir. Antes de cada merge a `main`, resúmele el diff (qué cambia, por qué, qué podría romperse). Ofrece recorridos guiados de un flujo a la vez.

## Freemium (base gratuita + complemento de pago)

Un proyecto con parte de pago son dos módulos, y **los dos** van con `"paizo": "orc"`:

- **Base:** repo público, `"mode": "public"`, código MIT. Funciona al 100 % sola: ninguna función suya depende de que el complemento esté instalado. Se publica en foundryvtt.com (gratuita, con el mismo id) antes del primer release del complemento: el manifiesto protegido no puede llevar su `manifest` (enlace a GitHub), así que Foundry la encuentra solo por su id.
- **Complemento:** repo privado, `"mode": "protected"`, código con todos los derechos reservados, `relationships.requires` hacia la base en su `module.json` (ese `requires` sí va; el prohibido es el de `pf2e-baron-core`). Corrige también su README: el resumen en inglés y la línea *Requiere* heredados dicen que no necesita otro módulo.
- **El código de pago vive solo en el complemento.** Nada de funciones de pago escondidas en la base tras una bandera o un ajuste: el repo de la base es público y MIT.
- **La base expone un registro de funciones** en su API pública, puesta en `init` (regla 12): por ejemplo `api.registerFeature(key, def)`. El complemento se registra desde su `setup` o `ready` con `game.modules.get("<id-de-la-base>")?.api`. La base consulta el registro cuando lo usa, no una sola vez al arrancar, para no depender del orden de carga. Esa API es un contrato con el complemento: no la rompas sin subir la versión mayor.
- **Nunca imports entre los dos módulos** (regla 3): todo pasa por la API.
- **El complemento guarda sus datos bajo su propio scope de flags** (su id) y sus propios ajustes; los datos de la base los lee con `doc.flags?.[idBase]?.[key]` (regla 6).

### Crear un complemento de pago

Requisitos del autor: una sola vez, el Premium Content Agreement de Foundry; por cada base, publicarla en foundryvtt.com como paquete gratuito con el mismo id antes del primer release del complemento (sin `manifest` en el `requires`: Foundry la encuentra por su id).

1. *Use this template* hacia un repo **privado** con el id del complemento.
2. `node tools/init-module.mjs ... --mode protected --requires <id-de-la-base>` (escribe la base en `relationships.requires`).
3. Llena `"landingUrl"` en `baron.json` y los corchetes de la ORC en `NOTICE.md`; corrige el README (resumen en inglés, *Requiere*, *Instalación*).
4. El complemento registra sus funciones en la API de la base desde su `setup` o `ready`, nunca con un import.
5. Etiqueta: la CI (baron-core posterior a v1.0.0) arma el ZIP protegido y lo publica como release del repo privado; nunca el canal `dev`.
6. A mano: sube el ZIP en https://foundryvtt.com/creators/upload (la primera versión espera aprobación), elige los niveles de Patreon en la página del paquete y prueba la instalación desde una cuenta de mecenas (tiene que instalar también la base).

## Avisos legales (`NOTICE.md`)

Nada de esto es asesoría legal: la licencia de Paizo, las marcas en el id o el título y las atribuciones son decisiones de BaronHVC.

- `NOTICE.md` viaja en el ZIP de cada release (baron-core v1.1.1 o posterior): solo la línea de título, los avisos de la licencia de `"paizo"` y sus campos. Nunca notas de trabajo ni instrucciones: esas van aquí o en el README (*Licencia y avisos legales*).
- Los avisos se copian exactos, en inglés, de la página de Paizo citada como **Fuente**; no los redactes, resumas ni traduzcas. Antes de cada publicación hay que volver a abrir esa página y compararlos.
- Con `"paizo": "orc"`, los corchetes de la plantilla (`[Title of Work]`, `[Copyright Notice]`, `[Author Credit Information]`, el Reserved Material, `[ninguno]`) se llenan antes de publicar: un renglón por cada obra ORC que use el módulo, según el *Sample Notice* de la sección III, con título, copyright y créditos tal como vienen en el aviso ORC del libro. La ORC nunca licencia marcas de Paizo.
- Un campo que espera la firma de BaronHVC (una atribución sin cotejar con el libro, una decisión legal) lleva una línea `PENDIENTE: <qué falta>`; solo él la quita. La revisión `[l]` de check-module avisa en cada push de los corchetes sin llenar y, con un núcleo posterior a v1.2.0, también de las líneas `PENDIENTE:`; con ese núcleo, `--release` (regla 7) falla con los dos. Con v1.2.0, `--release` solo avisa de los corchetes: revísalos tú antes de etiquetar.
- No copies texto, arte ni íconos de los compendios de PF2e al módulo.

## Estilo

- Comentarios de código en inglés, cortos, explicando el **porqué**.
- README, CHANGELOG, NOTICE y comentarios de los workflows en español (los avisos de Paizo, en inglés, como los publica Paizo).
