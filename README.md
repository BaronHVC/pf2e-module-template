<!-- baron:template-only:start -->
# pf2e-module-template

*Template repository for new Foundry VTT modules of the BaronHVC Pathfinder Second Edition family. It provides the module skeleton (manifest, entry script, scoped stylesheet, English and Spanish language files), a vendored copy of the shared `pf2e-baron-core` library pinned by `baron-core.lock.json`, thin CI and release workflows that call the reusable pipeline kept in `pf2e-baron-core`, a bug-report form, and the legal notice blocks for both Paizo licenses (Community Use Policy and ORC License), chosen apart from the distribution mode so a free base and its paid add-on can both use ORC. Create a repository from it, run `tools/init-module.mjs` once, link it into Foundry with `tools/link-foundry.ps1`, and develop.*

Plantilla para los módulos nuevos de la familia BaronHVC para PF2e. Todo lo que aparece como `__ALGO__` es un placeholder que `tools/init-module.mjs` reemplaza: no los cambies a mano.

## Requisitos (una sola vez)

- En GitHub, en **este** repo: **Settings → General → Template repository** marcado. Sin eso no aparece el botón *Use this template*.
- `pf2e-baron-core` clonado en la misma carpeta donde vivirán los módulos (los comandos usan `../pf2e-baron-core`):

  ```
  git clone git@github-baron:BaronHVC/pf2e-baron-core.git
  ```

  (`github-baron` es el alias SSH de la cuenta BaronHVC; sin alias: `git clone https://github.com/BaronHVC/pf2e-baron-core.git`). Un clon normal trae las etiquetas que necesita `check-module --online`.

## Cómo empezar un módulo

1. En GitHub, en este repo: **Use this template → Create a new repository**. El nombre del repo es el id del módulo (por ejemplo `pf2e-baron-shop`). Si el módulo será **de pago** (`--mode protected`), el repo es **privado**. GitHub corre la CI en ese primer commit: con la plantilla sin inicializar, `module-check` solo deja un aviso y se salta el check.
2. Clónalo junto a `pf2e-baron-core` (en una carpeta con el mismo nombre que el id) y, desde la raíz del repo nuevo, corre una sola vez:

   ```
   node tools/init-module.mjs --id pf2e-baron-shop --title "Baron's Shop" --description "Una tienda para PF2e." --author BaronHVC --prefix bshop --mode public
   ```

   - `--id`: minúsculas, dígitos y guiones. Es el id del manifiesto, el scope de los flags, el namespace de los ajustes y el prefijo de idioma, **para siempre**.
   - `--prefix`: prefijo corto para CSS y clases (empieza con letra, 2 a 12 letras o dígitos): `bshop` da `.bshop-app` y `.bshop-open`.
   - `--mode` y `--paizo`: cómo se distribuye y qué licencia de Paizo cubre el material del juego (ver *Las dos decisiones*, abajo). `--paizo` es opcional.
   - `--requires` (opcional, una sola vez): id del módulo sin el que este no funciona; lo escribe en `relationships.requires` de `module.json`. Un complemento de pago lleva aquí su base (ver *Crear un complemento de pago*). Nunca `pf2e-baron-core`, que va vendorizado.

   El script reemplaza los placeholders, escribe `mode` y `paizo` en `baron.json` (con `"landingUrl": ""`, que un módulo de pago llena antes de su primer release; uno de pago queda además con `"devChannel": false`, porque nunca publica el canal de pruebas) y `"humanText": "signed"`, el candado que pide tu firma en cada texto antes de etiquetar (ver *Firmar los textos antes de etiquetar*), deja en `NOTICE.md` solo los avisos de la licencia de Paizo elegida (sin las notas para el autor, porque viaja en el ZIP del release), escribe `LICENSE` según el modo, quita esta sección del README y se borra a sí mismo. Si encuentra `../pf2e-baron-core/REGISTRY.md`, rechaza un id o un prefijo que ya estén registrados; avisa si la carpeta o el remoto `origin` no se llaman como el id (las URLs del README y de `module.json` usan el id). Al final imprime la fila para `REGISTRY.md` de `pf2e-baron-core`: un módulo **gratuito** la registra ya, antes de escribir código; uno **de pago**, solo cuando se publique (ese repo es público).
3. Enlázalo con Foundry: `powershell -NoProfile -ExecutionPolicy Bypass -File tools/link-foundry.ps1` (detalles abajo, en *Desarrollo*).
4. Abre Foundry, entra a un mundo con el sistema PF2e y activa el módulo en **Manage Modules**.
5. Haz el primer commit y súbelo (comandos separados: Windows PowerShell 5.1 no acepta `&&`):

   ```
   git add -A
   git commit -m "Initialize <id> from pf2e-module-template"
   git push
   ```

## Las dos decisiones: `--mode` y `--paizo`

Son independientes: `--mode` dice cómo se distribuye el paquete (y con eso su `LICENSE`); `--paizo`, qué licencia de Paizo cubre el material del juego (y con eso su `NOTICE.md`). La licencia de Paizo la decide el **proyecto completo**, no el precio de cada paquete: la Community Use Policy prohíbe cualquier muro de pago en el proyecto, así que en cuanto un proyecto tiene una parte de pago, **todos** sus paquetes van con ORC.

| Caso | `--mode` | `--paizo` | `LICENSE` | `NOTICE.md` |
|---|---|---|---|---|
| Módulo gratuito sin ninguna parte de pago | `public` | `cup` (por defecto) | MIT | Community Use Policy |
| Base gratuita de un freemium, o gratuito que prefiere ORC | `public` | `orc` | MIT | ORC License |
| Complemento de pago | `protected` | `orc` (por defecto) | todos los derechos reservados | ORC License |

`--mode protected --paizo cup` no existe: `init-module` lo rechaza sin escribir nada. Con `--paizo orc`, rellena los corchetes de `NOTICE.md` antes de publicar; y como la ORC nunca licencia marcas de Paizo, "PF2e", "Pathfinder" (o Starfinder, Golarion, Paizo) en el id o el título es una pregunta legal abierta (el script lo avisa). Por eso los ejemplos con ORC usan ids sin `pf2e`: el id es para siempre.

```
node tools/init-module.mjs --id pf2e-baron-shop --title "Baron's Shop" --description "Una tienda para PF2e." --author BaronHVC --prefix bshop --mode public
node tools/init-module.mjs --id baron-shop --title "Baron's Shop" --description "Una tienda para PF2e." --author BaronHVC --prefix bshop --mode public --paizo orc
node tools/init-module.mjs --id baron-shop-plus --title "Baron's Shop Plus" --description "Funciones extra para Baron's Shop." --author BaronHVC --prefix bshplus --mode protected --requires baron-shop
```

(Uno por caso de la tabla; cada uno en su propio repo.)

### Freemium: base gratuita + complemento de pago

- **Base:** repo público, `--mode public --paizo orc`, código MIT. Funciona **al 100 % sola**, con o sin el complemento. Se publica en foundryvtt.com como paquete gratuito antes del primer release del complemento (ver abajo).
- **Complemento:** su propio repo **privado**, `--mode protected` (ORC por defecto), código con todos los derechos reservados. En su `module.json`, `relationships.requires` apunta a la base: `--requires baron-shop` escribe `{ "id": "baron-shop", "type": "module", "compatibility": {} }` (sin `--requires`, el script avisa). En su README, corrige el resumen en inglés y la línea *Requiere*, que heredan "no necesita ningún otro módulo" (el script lo recuerda).
- El código de pago vive **solo** en el complemento: nada de funciones de pago escondidas tras una bandera en el repo público.
- La base expone en su `init` un registro de funciones en su API (`game.modules.get(id).api`); el complemento se registra ahí desde su `setup` o `ready`. Nunca un import entre los dos módulos.
- El complemento guarda sus datos bajo su propio scope de flags (su id), no bajo el de la base.

Las reglas de código están en `CLAUDE.md` (sección *Freemium*), que hereda cada módulo.

### Crear un complemento de pago

Requisitos previos:

- Una sola vez: aceptar el **Premium Content Agreement** de Foundry en tu cuenta de creador de foundryvtt.com.
- Por cada base, antes del primer release del complemento: la **base gratuita publicada en foundryvtt.com** como paquete gratuito normal, con el mismo id que pasas a `--requires`. El manifiesto protegido no puede llevar el `manifest` de la base (es un enlace a GitHub, y el release protegido los rechaza todos), así que Foundry la encuentra solo por su id en el listado de foundryvtt.com: si no está ahí, un mecenas que instala el complemento no tiene de dónde bajar la base. No agregues ese `manifest` al `requires`.

1. **Use this template → Create a new repository**, con el repo **privado** y el id del complemento como nombre (por ejemplo `baron-shop-plus`).
2. Inicialízalo como complemento de su base:

   ```
   node tools/init-module.mjs --id baron-shop-plus --title "Baron's Shop Plus" --description "Funciones extra para Baron's Shop." --author BaronHVC --prefix bshplus --mode protected --requires baron-shop
   ```

3. Llena `"landingUrl"` en `baron.json` con una URL `https` pública del módulo (la página del paquete, `https://foundryvtt.com/packages/<id>`, o tu Patreon): el manifiesto protegido la usa como `url`, porque la del repo privado no puede publicarse, y `check-module` falla mientras esté vacía. Rellena los corchetes de `NOTICE.md` (ORC) y corrige en el README el resumen en inglés, la línea *Requiere* y la sección *Instalación*.
4. Escribe el código: el complemento registra sus funciones en la API de la base desde su `setup` o `ready` (`game.modules.get("baron-shop")?.api`), nunca con un import.
5. Etiqueta (`git tag v0.1.0` y luego `git push origin v0.1.0`). La CI arma el ZIP protegido (`"protected": true`, sin `download`, manifiesto alojado por Foundry) y lo publica como release **del repo privado**; nunca toca el canal `dev`.
6. A mano, con la lista que deja el resumen del workflow: descarga el ZIP de ese release, súbelo en https://foundryvtt.com/creators/upload al paquete `<id>` con su versión y compatibilidad (la primera versión espera la aprobación de Foundry), elige los niveles de Patreon en la página del paquete y prueba la instalación desde una cuenta de mecenas: Foundry tiene que instalar también la base. Los mecenas obtienen acceso al vincular su Patreon en su perfil de foundryvtt.com.

El paso 5 necesita un baron-core posterior a v1.0.0 (resincroniza con `sync-core`): con v1.0.0, `module-release.yml` falla a propósito en modo protegido.

Todo lo que sigue a esta sección es el README que hereda el módulo.
<!-- baron:template-only:end -->
# __TITLE__

*English summary: __TITLE__ (`__MODULE_ID__`) is a Foundry VTT module for the Pathfinder Second Edition (PF2e) system, available in English and Spanish. It belongs to the BaronHVC module family and ships a vendored copy of the shared `pf2e-baron-core` library (`scripts/baron-core.js`, pinned by `baron-core.lock.json`); it does not need any other module installed. Releases are built by tag from the reusable pipeline in `pf2e-baron-core`.*

> __DESCRIPTION__

## Instalación

En Foundry: **Add-on Modules → Install Module** y pegar la URL del manifiesto:

```
https://github.com/BaronHVC/__MODULE_ID__/releases/latest/download/module.json
```

Las versiones estables llegan solas por el botón **Update** de Foundry.

Canal de pruebas (cada versión de prueba reemplaza la anterior en la misma URL):

```
https://github.com/BaronHVC/__MODULE_ID__/releases/download/dev/module.json
```

Requiere Foundry VTT v13 o v14 y el sistema PF2e 7.0 o posterior.

## Desarrollo

Los comandos suponen que `pf2e-baron-core` está clonado junto a este repo (`../pf2e-baron-core`).

### Enlazar el repo con Foundry

```
powershell -NoProfile -ExecutionPolicy Bypass -File tools/link-foundry.ps1
```

`-ExecutionPolicy Bypass` vale solo para esa ejecución y no cambia ningún ajuste: sin él, Windows con la política por defecto (`Restricted`) se niega a correr el script. Crea una *junction* `<Data>/modules/__MODULE_ID__` que apunta a esta carpeta, así Foundry carga directamente lo que editas (basta con recargar el navegador). Busca la carpeta Data en `dataPath` de `%LOCALAPPDATA%\FoundryVTT\Config\options.json`, y si no existe usa `%LOCALAPPDATA%\FoundryVTT\Data`. Para otra ubicación: `-DataPath "D:\FoundryData\Data"`. Si ya existe algo con ese nombre en `modules/`, no lo toca y avisa.

### El núcleo compartido (baron-core)

`scripts/baron-core.js` es una copia vendorizada de `pf2e-baron-core`: un módulo ES que se importa con `import { ... } from "./baron-core.js"` desde los scripts de este módulo y que **no** va en `esmodules`. Al importarse no registra nada: los hooks, ajustes y helpers se registran en `scripts/main.js`. `baron-core.lock.json` guarda versión, commit y hash de esa copia.

Nunca se editan a mano. Para cambiar de versión:

```
node ../pf2e-baron-core/tools/sync-core.mjs . --ref v1.0.0-rc.1
```

Eso copia el archivo de ese commit, reescribe el lock y repinta el commit de los workflows en `.github/workflows/`.

Para desarrollar el núcleo y el módulo a la vez:

```
node ../pf2e-baron-core/tools/sync-core.mjs . --watch
```

Copia el archivo del árbol de trabajo del núcleo en cada cambio (Ctrl+C para salir) y marca el lock como `dev`. Una copia `dev` nunca pasa el check: antes de hacer commit, vuelve a sincronizar con `--ref`.

### Revisar antes de cada commit y cada etiqueta

```
# antes de cada commit
node ../pf2e-baron-core/tools/check-module.mjs .
# antes de cada etiqueta: lo mismo que corre la CI del release
node ../pf2e-baron-core/tools/check-module.mjs . --core-repo ../pf2e-baron-core --online --release
```

Con `--release`, un texto que todavía empieza con `TODO-HUMANO:` en `lang/*.json` o en el título o la descripción de `module.json` falla en vez de solo avisar (regla 15 del CLAUDE.md: los textos que ve el usuario los escribe una persona, por la política de IA de Foundry), y con un núcleo posterior a v1.4.0 también un texto sin tu firma (ver *Firmar los textos antes de etiquetar*, abajo). Con un núcleo posterior a v1.2.0 pasa lo mismo con `NOTICE.md`: un corchete de la plantilla sin llenar o una línea con `PENDIENTE:` (ver *Licencia y avisos legales*) avisan en cada push y fallan con `--release`.

Revisa que existan los archivos declarados en `module.json` y las plantillas que usan los scripts, la sintaxis de los scripts, los JSON, la paridad en/es, el lock contra la copia vendorizada (y, con `--online`, contra el repo del núcleo y el pin de los workflows), los imports, las claves de idioma, los identificadores persistidos de `baron.json`, que no queden placeholders, que la licencia de Paizo de `baron.json` coincida con `NOTICE.md` y, en un módulo de pago, que `"landingUrl"` sea una URL `https` y que `module.json` requiera su base. CI corre las mismas revisiones en cada push, pero con el `check-module` del commit del núcleo fijado en el lock: una revisión que el núcleo agregue después (como la de la licencia de Paizo, posterior a v1.0.0-rc.1) llega a la CI cuando resincronizas a una versión que la traiga.

Las pruebas de `test/*.test.mjs` corren en la CI en cada push y en cada release, y una prueba roja no deja publicar la etiqueta (desde el núcleo v1.4.0; también `tests/`, subcarpetas y `.test.js`, o `npm test` si `package.json` tiene un script `test`): córrelas antes con `node --test test/*.test.mjs`.

### Firmar los textos antes de etiquetar

`baron.json` trae `"humanText": "signed"`: además del marcador `TODO-HUMANO:`, la revisión `[n]` pide que cada texto de los idiomas de `module.json` (`lang/en.json`, `lang/es.json`; si no declarara ninguno, cada `lang/*.json`) y el título y la descripción de `module.json` lleven tu firma en `human-text.json` (regla 15 del CLAUDE.md); un `lang/*.json` sin declarar también la bloquea, porque viaja en el ZIP. Durante el desarrollo, `lang/*.json` puede llevar textos de trabajo escritos por IA, anotados con su intención en `docs/textos-borrador.md`, solo cuando `baron-core.lock.json` fija un núcleo posterior a v1.4.0 (el primero cuya CI revisa las firmas); hasta entonces, un texto nuevo lleva el marcador. Antes de cada etiqueta:

1. Reescribe desde cero cada texto de trabajo: revisar o retocar el de la IA no cumple la política de IA de Foundry (§4.1). Una traducción hecha con IA la revisa, línea por línea contra su original humano, una persona que domina el idioma, y la firma esa persona: en una traducción, su `s` dice «domino este idioma y revisé esta traducción». Con un clon del núcleo posterior a v1.5.0, BaronHVC e IAR18 escriben los textos en una hoja: `node ../pf2e-baron-core/tools/text-sheet.mjs export` escribe `textos-hoja.csv` (fuera de git) con cada texto que falta, dónde aparece y su intención de `docs/textos-borrador.md`, sin el texto de la IA; la llenan en Excel o Google Sheets, la guardan como «CSV UTF-8 (delimitado por comas)» y `node ../pf2e-baron-core/tools/text-sheet.mjs import textos-hoja.csv` los pasa a `lang/*.json` y a `module.json` (una sesión de Claude puede correr `export` e `import`, pero nunca llena las columnas de idioma ni la de `author`; ver *Escribir los textos en la hoja* en el README del núcleo). Cada uno pone su nombre en la columna `author` de lo que escribe; `import` lista al final las filas de cada nombre, y BaronHVC las firma en seguida (pasos 2 y 3), antes del siguiente `export`.
2. Mira qué falta firmar (archivo, clave y valor de cada texto) y quién escribió lo ya firmado: `node ../pf2e-baron-core/tools/sign-text.mjs .`
3. Firma quien da fe de los textos ante Foundry al subir el paquete, BaronHVC, en su terminal (PowerShell, Windows Terminal o Git Bash), sin tubería ni redirección (nada de `|`, `>` ni `Tee-Object`): con una, stdout deja de ser una terminal y se niega. Con un núcleo posterior a v1.6.0, `node ../pf2e-baron-core/tools/sign-text.mjs . --sign --sheet textos-hoja.csv` pregunta por cada texto que `import` escribió de esa hoja «¿<author> escribió este texto desde cero? [s/N/q]», con el nombre de su fila, y guarda ese autor con la firma; `--sign --author IAR18` pregunta lo mismo por todos los pendientes, de un solo autor. `--sign` solo pregunta «¿Escribiste tú este texto desde cero?» y no guarda autor: es para lo que escribió quien firma. Antes de la primera pregunta explica cada respuesta: contesta `s` solo si ese autor lo escribió desde cero (o, en una traducción, si la revisó como en el paso 1); `N` o Enter lo salta y `q` termina guardando lo firmado. Un Ctrl+C termina sin guardar nada de esa corrida. Solo con un Git for Windows anterior a 2.54, Git Bash (mintty) no le da una terminal a node; ahí, antepón `winpty`: `winpty node ../pf2e-baron-core/tools/sign-text.mjs . --sign --sheet textos-hoja.csv`.
4. Borra de `docs/textos-borrador.md` las filas de lo que firmaste, haz commit de `human-text.json` y de `human-text-authors.json` y corre el `check-module ... --release` de arriba: falla mientras quede un texto sin firmar.

Cualquier cambio a un texto ya firmado, aunque sea un espacio, pide firmarlo otra vez. `human-text.json` y `human-text-authors.json` (quién escribió cada texto firmado) van en el repo pero no en el ZIP del release, y solo los escribe `sign-text`: nunca los edites a mano ni dejes que una sesión de Claude corra `--sign`. `check-module` solo lee `human-text.json`. La CI revisa las firmas con un núcleo posterior a v1.4.0 fijado en `baron-core.lock.json` (el `init` avisa mientras no lo esté); hasta entonces, córrelo tú con el `check-module` de tu clon del núcleo. Las etiquetas de compendios, el texto fijo de `templates/*.hbs` y el texto de chat de `scripts/` no los revisa el candado: escríbelos tú.

## Publicar

La versión la pone la **etiqueta**: el `version`, `manifest` y `download` de `module.json` en el repo no importan, el pipeline los reescribe.

- **Prueba:** `git tag v0.2.0-rc.1` y luego `git push origin v0.2.0-rc.1`. Sale como *prerelease* con su propio manifiesto (nunca se ofrece como actualización a quien instaló la estable) y, solo en `mode: public`, actualiza el canal de pruebas `dev`.
- **Estable:** `git tag v0.2.0` y luego `git push origin v0.2.0`. Sale como release normal. Solo en `mode: public`: el manifiesto `releases/latest` lo ofrece como actualización, y también actualiza el canal `dev`, para que quien instaló desde ahí reciba la versión nueva.

Son dos comandos separados a propósito: Windows PowerShell 5.1 no acepta `&&` (en Git Bash sí).

El workflow `.github/workflows/release.yml` solo llama a `module-release.yml` de `pf2e-baron-core`, fijado al commit del lock. Ese pipeline corre `check-module`, reescribe `module.json`, arma `__MODULE_ID__-<etiqueta>.zip` con la carpeta `__MODULE_ID__/` (solo `module.json`, `scripts`, `styles`, `templates`, `lang`, `packs`, `LICENSE` y `NOTICE.md`, los que existan) y lo publica en GitHub Releases. El canal `dev` usa la versión numérica `X.Y.Z.<número de corrida>` porque Foundry compara mal sufijos como `-rc10` contra `-rc9`.

Con `"mode": "protected"` en `baron.json` (paquete de pago alojado por Foundry), el pipeline exige que el repo sea privado y reescribe `module.json` para Foundry: `"protected": true`, sin `download`, el manifiesto `https://r2.foundryvtt.com/packages-public/__MODULE_ID__/module.json` y, como `url`, el `"landingUrl"` de `baron.json`. Falla si queda cualquier enlace a GitHub (`github.com`, `githubusercontent.com`, `github.io`, también en una clave o en el `manifest` de una dependencia), para que el repo privado nunca aparezca en un manifiesto publicado; `check-module` lo marca en cada push. Publica el ZIP y ese `module.json` como release **de este repo privado** y nunca toca el canal `dev`: en un repo privado nadie podría descargarlo, y en uno público regalaría el paquete. La subida a Foundry es a mano, con la lista que deja el resumen del workflow: descarga el ZIP del release, súbelo en https://foundryvtt.com/creators/upload al paquete `__MODULE_ID__` con su versión y compatibilidad (la primera versión espera la aprobación de Foundry), elige los niveles de Patreon en la página del paquete y prueba la instalación desde una cuenta de mecenas (los mecenas vinculan su Patreon en su perfil de foundryvtt.com). Una etiqueta de prueba (`v0.2.0-rc.1`) solo comprueba que el paquete protegido se arma: **nunca la subas a Foundry**, porque Foundry compara versiones por segmentos y como texto y la estable `0.2.0` no contaría como más nueva que `0.2.0-rc.1`, y su ZIP no se instala a mano (Foundry esconde un paquete protegido de tu propia instalación); el código se prueba desde la copia de trabajo, enlazada con `tools/link-foundry.ps1`. Requisito previo, una sola vez: el Premium Content Agreement de Foundry. Todo esto llega con un baron-core posterior a v1.0.0 (resincroniza con `sync-core`); con v1.0.0, el release protegido falla a propósito.

Antes de etiquetar: los textos firmados con `sign-text --sign`, los de IAR18 con `--sheet` o `--author` (ver *Firmar los textos antes de etiquetar*), `check-module` en verde, la versión de baron-core anotada en `CHANGELOG.md`, y los arreglos de comportamiento en su propio release.

## Licencia y avisos legales

Los avisos sobre material de Paizo están en [NOTICE.md](NOTICE.md), que viaja también en el ZIP de cada release: copia los avisos además a la descripción del paquete en foundryvtt.com. Son dos ejes independientes de `baron.json`. `paizo` elige la licencia de Paizo: `cup` (Community Use Policy) solo para un módulo gratuito sin ninguna parte de pago; `orc` (ORC License) para un paquete de pago y también para la base gratuita de un freemium, porque la Community Use Policy prohíbe cualquier muro de pago en el proyecto. `mode` elige la licencia del código, en [LICENSE](LICENSE), que escribe `init-module`: **MIT** para `public` y **todos los derechos reservados** para `protected`, a nombre de `--author`. En los dos casos `scripts/baron-core.js` sigue siendo MIT, la licencia de [pf2e-baron-core](https://github.com/BaronHVC/pf2e-baron-core). La licencia cubre solo el código: el material de Paizo va con los avisos de `NOTICE.md`. Si cambias `paizo`, reemplaza `NOTICE.md` entero en el mismo commit: corre `tools/init-module.mjs` con el `--paizo` nuevo y los mismos id, título, descripción, autor y prefijo en un clon aparte de pf2e-module-template, y copia su `NOTICE.md`. No pegues el bloque nuevo junto al viejo: un módulo bajo una licencia no puede mostrar el aviso de la otra. `check-module` revisa que coincidan (la CI, cuando el lock apunte a un núcleo con esa revisión).

**Antes de cada publicación** (esto no es asesoría legal; si hay dinero de por medio, consúltalo con un abogado):

- Vuelve a abrir la página de Paizo citada como **Fuente** en `NOTICE.md`, compara el texto y, si cambió, usa el nuevo, exacto y en inglés.
- Con `paizo: "orc"`, rellena los corchetes `[ ]`: en el *Attribution Notice*, un renglón por cada obra ORC que use el módulo, siguiendo el *Sample Notice* de la sección III de la licencia (título, aviso de copyright y créditos de autor tal como vienen en el aviso ORC de cada libro, incluidos los licenciantes de los que deriva) y el aviso de copyright del módulo; luego el *Reserved Material* y el *Expressly Designated Licensed Material*. La ORC nunca licencia marcas de Paizo: "PF2e" o "Pathfinder" en el id o el título es una pregunta legal abierta.
- Un campo que espera tu firma (una atribución sin cotejar con el libro, una decisión legal) lleva una línea con `PENDIENTE:` y qué falta. Es el marcador de la familia para eso. `check-module` avisa en cada push de un corchete sin llenar y, con un núcleo posterior a v1.2.0, también de una línea `PENDIENTE:`; con ese núcleo, el release (`--release`) no publica mientras quede alguno de los dos.
- `NOTICE.md` lleva solo la línea de título, los avisos y sus campos: es lo que recibe cada usuario. Las notas de trabajo van aquí o en `CLAUDE.md`. El resumen de qué implica cada licencia está en el `NOTICE.md` de pf2e-module-template.

## Reglas de la familia (resumen)

La versión completa, para sesiones de Claude, está en [CLAUDE.md](CLAUDE.md).

- `scripts/baron-core.js` y `baron-core.lock.json` solo los escribe `sync-core`.
- Los identificadores persistidos (`__MODULE_ID__` como scope de flags, slugs de reglas, roll options, claves de ajustes) no cambian nunca y se listan en `baron.json` → `persisted`.
- Ningún import de la carpeta de otro módulo.
- Los hooks viven en los archivos de entrada; los que escriben documentos desde hooks que reciben todos los clientes (`createX`/`updateX`/`deleteX`, turnos, chat) se protegen con `isSoleExecutor()`; los `preX` y los de la interfaz, nunca.
- Nunca `getFlag`/`setFlag` con el scope de otro módulo: se lee `doc.flags?.[scope]?.[key]`.
- Claves de idioma con el prefijo `__MODULE_ID__.`, CSS bajo `.__PREFIX__-app` o clases `__PREFIX__-*`, helpers de Handlebars con prefijo `__PREFIX__`.
- Los textos que ve el usuario (`lang/*.json`, título y descripción de `module.json`) los escriben desde cero BaronHVC o IAR18, y antes de etiquetar los firma BaronHVC en su terminal con `sign-text --sign`, nombrando al autor real con `--sheet` o `--author`; los borradores de IA se anotan en `docs/textos-borrador.md`.
