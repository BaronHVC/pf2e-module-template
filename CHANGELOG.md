# Changelog

Todos los cambios notables de __TITLE__ (`__MODULE_ID__`) se anotan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el módulo usa [Versionado Semántico](https://semver.org/lang/es/). La versión la pone la etiqueta (`vX.Y.Z`); el `version` de `module.json` en el repo no cuenta.

Reglas de cada entrada:

- Cada release anota la versión de **baron-core** que lleva vendorizada (`scripts/baron-core.js`, fijada por `baron-core.lock.json`).
- Si el release trae un baron-core con cambios de **comportamiento** (su CHANGELOG lo marca), se dice aquí, junto con la prueba de regresión que se volvió a correr.
- Los arreglos de comportamiento salen en su propio release, nunca mezclados con funciones nuevas.

## [Sin publicar]

- baron-core: 1.0.0-rc.1

### Agregado

- Esqueleto inicial creado desde `pf2e-module-template`.

<!--
Plantilla para cada versión:

## [0.2.0] - AAAA-MM-DD

- baron-core: X.Y.Z (sin cambios | interno | comportamiento: <exports afectados>)

### Agregado
### Cambiado
### Corregido
### Eliminado
-->
