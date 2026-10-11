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

   El script reemplaza los placeholders, escribe `mode` y `paizo` en `baron.json`, deja en `NOTICE.md` solo el bloque de la licencia de Paizo elegida, escribe `LICENSE` según el modo, quita esta sección del README y se borra a sí mismo. Si encuentra `../pf2e-baron-core/REGISTRY.md`, rechaza un id o un prefijo que ya estén registrados; avisa si la carpeta o el remoto `origin` no se llaman como el id (las URLs del README y de `module.json` usan el id). Al final imprime la fila para `REGISTRY.md` de `pf2e-baron-core`: un módulo **gratuito** la registra ya, antes de escribir código; uno **de pago**, solo cuando se publique (ese repo es público).
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

`--mode protected --paizo cup` no existe: `init-module` lo rechaza sin escribir nada. Con `--paizo orc`, rellena los corchetes de `NOTICE.md` antes de publicar; y como la ORC nunca licencia marcas de Paizo, "PF2e" o "Pathfinder" en el id o el título es una pregunta legal abierta (el script lo avisa).

```
node tools/init-module.mjs --id pf2e-baron-shop --title "Baron's Shop" --description "Una tienda para PF2e." --author BaronHVC --prefix bshop --mode public
node tools/init-module.mjs --id pf2e-baron-shop --title "Baron's Shop" --description "Una tienda para PF2e." --author BaronHVC --prefix bshop --mode public --paizo orc
node tools/init-module.mjs --id pf2e-baron-shop-plus --title "Baron's Shop Plus" --description "Funciones extra para Baron's Shop." --author BaronHVC --prefix bshplus --mode protected
```

(Uno por caso de la tabla; cada uno en su propio repo.)

### Freemium: base gratuita + complemento de pago

- **Base:** repo público, `--mode public --paizo orc`, código MIT. Funciona **al 100 % sola**, con o sin el complemento.
- **Complemento:** su propio repo **privado**, `--mode protected` (ORC por defecto), código con todos los derechos reservados. En su `module.json`, `relationships.requires` apunta a la base: `{ "id": "pf2e-baron-shop", "type": "module" }`.
- El código de pago vive **solo** en el complemento: nada de funciones de pago escondidas tras una bandera en el repo público.
- La base expone en su `init` un registro de funciones en su API (`game.modules.get(id).api`); el complemento se registra ahí desde su `setup` o `ready`. Nunca un import entre los dos módulos.
- El complemento guarda sus datos bajo su propio scope de flags (su id), no bajo el de la base.

Las reglas de código están en `CLAUDE.md` (sección *Freemium*), que hereda cada módulo.

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
node ../pf2e-baron-core/tools/check-module.mjs .
node ../pf2e-baron-core/tools/check-module.mjs . --core-repo ../pf2e-baron-core --online
```

Revisa que existan los archivos declarados en `module.json` y las plantillas que usan los scripts, la sintaxis de los scripts, los JSON, la paridad en/es, el lock contra la copia vendorizada (y, con `--online`, contra el repo del núcleo y el pin de los workflows), los imports, las claves de idioma, los identificadores persistidos de `baron.json` y que no queden placeholders. CI corre lo mismo en cada push.

## Publicar

La versión la pone la **etiqueta**: el `version`, `manifest` y `download` de `module.json` en el repo no importan, el pipeline los reescribe.

- **Prueba:** `git tag v0.2.0-rc.1` y luego `git push origin v0.2.0-rc.1`. Sale como *prerelease* con su propio manifiesto (nunca se ofrece como actualización a quien instaló la estable) y actualiza el canal de pruebas `dev`.
- **Estable:** `git tag v0.2.0` y luego `git push origin v0.2.0`. Sale como release normal; el manifiesto `releases/latest` lo ofrece como actualización. También actualiza el canal `dev`, para que quien instaló desde ahí reciba la versión nueva.

Son dos comandos separados a propósito: Windows PowerShell 5.1 no acepta `&&` (en Git Bash sí).

El workflow `.github/workflows/release.yml` solo llama a `module-release.yml` de `pf2e-baron-core`, fijado al commit del lock. Ese pipeline corre `check-module`, reescribe `module.json`, arma `__MODULE_ID__-<etiqueta>.zip` con la carpeta `__MODULE_ID__/` (solo `module.json`, `scripts`, `styles`, `templates`, `lang` y `packs`, los que existan) y lo publica en GitHub Releases. El canal `dev` usa la versión numérica `X.Y.Z.<número de corrida>` porque Foundry compara mal sufijos como `-rc10` contra `-rc9`.

Con `"mode": "protected"` en `baron.json` el release falla a propósito: el modo protegido (paquetes de pago alojados por Foundry) todavía no está implementado.

Antes de etiquetar: `check-module` en verde, la versión de baron-core anotada en `CHANGELOG.md`, y los arreglos de comportamiento en su propio release.

## Licencia y avisos legales

Los avisos sobre material de Paizo están en [NOTICE.md](NOTICE.md): revísalos antes de cada publicación y copia los avisos también a la descripción del paquete en foundryvtt.com (el ZIP del release no lleva `NOTICE.md`). Son dos ejes independientes de `baron.json`. `paizo` elige la licencia de Paizo: `cup` (Community Use Policy) solo para un módulo gratuito sin ninguna parte de pago; `orc` (ORC License) para un paquete de pago y también para la base gratuita de un freemium, porque la Community Use Policy prohíbe cualquier muro de pago en el proyecto. `mode` elige la licencia del código, en [LICENSE](LICENSE), que escribe `init-module`: **MIT** para `public` y **todos los derechos reservados** para `protected`, a nombre de `--author`. En los dos casos `scripts/baron-core.js` sigue siendo MIT, la licencia de [pf2e-baron-core](https://github.com/BaronHVC/pf2e-baron-core). La licencia cubre solo el código: el material de Paizo va con los avisos de `NOTICE.md`. Si cambias `paizo`, cambia `NOTICE.md` en el mismo commit (`check-module` revisa que coincidan).

## Reglas de la familia (resumen)

La versión completa, para sesiones de Claude, está en [CLAUDE.md](CLAUDE.md).

- `scripts/baron-core.js` y `baron-core.lock.json` solo los escribe `sync-core`.
- Los identificadores persistidos (`__MODULE_ID__` como scope de flags, slugs de reglas, roll options, claves de ajustes) no cambian nunca y se listan en `baron.json` → `persisted`.
- Ningún import de la carpeta de otro módulo.
- Los hooks viven en los archivos de entrada; los que escriben documentos desde hooks que reciben todos los clientes (`createX`/`updateX`/`deleteX`, turnos, chat) se protegen con `isSoleExecutor()`; los `preX` y los de la interfaz, nunca.
- Nunca `getFlag`/`setFlag` con el scope de otro módulo: se lee `doc.flags?.[scope]?.[key]`.
- Claves de idioma con el prefijo `__MODULE_ID__.`, CSS bajo `.__PREFIX__-app` o clases `__PREFIX__-*`, helpers de Handlebars con prefijo `__PREFIX__`.
