# Textos de trabajo escritos por IA

Regla 15 del [CLAUDE.md](../CLAUDE.md): durante el desarrollo, con `"humanText": "signed"` en `baron.json` y un `baron-core.lock.json` que fija un núcleo posterior a v1.4.0 (el primero cuya CI revisa las firmas), `lang/*.json` puede llevar textos de trabajo escritos por IA; sin las dos cosas, un texto nuevo lleva el marcador `TODO-HUMANO:`. Cada uno se anota aquí, con su intención, en el mismo commit que lo agrega o lo cambia. Antes de etiquetar, BaronHVC e IAR18 escriben cada uno desde cero en la hoja de textos (ver *Firmar los textos antes de etiquetar* en el README), nunca a partir del texto de la IA (retocarlo no cumple la política de IA de Foundry, §4.1), cada quien con su nombre en la columna `author` de lo que escribe; en seguida, después de `text-sheet import` y antes del siguiente `export`, BaronHVC los firma en su terminal por el autor de cada fila, con `node ../pf2e-baron-core/tools/sign-text.mjs . --sign --sheet textos-hoja.csv` (o con la hoja de cada persona, como `textos-hoja-IAR18.csv`, la que baja la página web donde escribe IAR18). Una vez firmado, su fila se borra. Mientras el lock fije v1.4.0 o uno anterior, la CI no bloquea los de esta tabla: reescríbelos y corre `check-module ... --release` desde tu clon del núcleo antes de etiquetar.

## Formato

`node ../pf2e-baron-core/tools/text-sheet.mjs export` (núcleo posterior a v1.5.0) pone en la hoja de textos lo que dice cada fila de aquí, en el orden de este archivo y con el encabezado de su sección en la columna `section`. La hoja solo trae las tablas: quienes escriben leen además las reglas que pongas aquí en prosa (términos, tono, largo), así que escríbelas para ellos. Lee toda tabla cuyo encabezado tenga una columna `clave`; la prosa, las demás tablas y los bloques de código se ignoran, así que las filas se pueden agrupar en secciones (un encabezado `###` por pantalla), con una tabla cada una. Las columnas se reconocen por su nombre, en cualquier orden:

- `clave`: la clave entre backticks, completa o sin el prefijo `__MODULE_ID__.`. El título y la descripción de `module.json` son `module.json:title` y `module.json:description`.
- `dónde aparece`: en qué parte de la interfaz se ve el texto y quién lo ve (la hoja agrega los `archivo:línea` del código que usa la clave).
- `intención`: qué debe comunicar y con qué restricciones (largo, tono, términos que comparte con otras claves). Nunca una redacción terminada, ni el texto de trabajo: una celda que cite un texto sin firmar (una oración de siete palabras o más, o cualquier texto entre comillas) sale vacía en la hoja, con un aviso de `export`.
- `variables`: los `{marcadores}` que el texto debe conservar, con qué llega en cada uno; `—` si no lleva ninguno. `text-sheet import` rechaza un texto que quite o agregue uno.
- `máx.`: una guía del largo en caracteres, sin contar los marcadores; pasarse solo avisa. Vacía si no hay guía.

Un `|` dentro de una celda se escribe `\|`. Un texto de `lang/*.json` sin fila sale en la hoja con la intención vacía, y una fila cuya clave ya no existe es un aviso de `text-sheet export`. Una tabla de conceptos, con una columna `concepto` y otra `claves donde aparece` (sin columna `clave`), no da filas: a la intención de cada clave de un renglón la hoja le agrega «mismo término que» las otras claves de ese renglón.

| clave | dónde aparece | intención | variables | máx. |
|---|---|---|---|---|
| `module.json:title` | lista de módulos de Foundry y página del paquete | el nombre del módulo; viene de `init-module --title` | — | |
| `module.json:description` | lista de módulos de Foundry y manifiesto del paquete | qué agrega el módulo, en una o dos oraciones de texto plano; viene de `init-module --description` | — | 200 |
| `__MODULE_ID__.Title` | título de la ventana del módulo y del botón de la cabecera de la hoja (ejemplo comentado de `scripts/main.js`) | el nombre del módulo, igual que `module.json:title`; viene de `init-module --title` | — | |
| `__MODULE_ID__.Open` | botón de la cabecera de la hoja que abre la ventana del módulo (ejemplo comentado de `scripts/main.js`) | viene de la plantilla: la acción del botón, en una o dos palabras | — | |
| `__MODULE_ID__.SettingGmOnly` | nombre del ajuste de mundo `gmOnly` en *Configure Settings* | viene de la plantilla: que el módulo lo pueda usar solo el GM | — | |
| `__MODULE_ID__.SettingGmOnlyHint` | ayuda bajo ese ajuste | viene de la plantilla: desactivado, los jugadores dueños de un objeto también pueden usar el módulo en él | — | |

Las filas de `module.json:title`, `module.json:description` y `__MODULE_ID__.Title` llevan lo que se escribió al correr `init-module`: si lo escribió una persona, BaronHVC lo firma tal cual con `sign-text --sign --author <quien lo escribió>` (`--author BaronHVC` o `--author IAR18`) y su fila se borra; si no, se escribe en la hoja como los demás.
