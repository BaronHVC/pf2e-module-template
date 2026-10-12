# Arquitectura de __TITLE__ (`__MODULE_ID__`)

Mapa del código para entenderlo, explicarlo y mantenerlo (regla 16 del CLAUDE.md, política de IA de Foundry §4.4). Las referencias `archivo:línea` se actualizan en el mismo commit que mueve el código.

## Mapa de archivos

| Archivo | Qué hace |
|---|---|
| `scripts/main.js` | Entrada: registra hooks y ajustes, y expone la API en `init`. |
| `scripts/baron-core.js` | Copia vendorizada de pf2e-baron-core (no se edita a mano). |

## Flujos

Uno por cada acción del usuario o evento de Foundry que importe.

### <Nombre del flujo>

- **Disparador:** <botón, hook, comportamiento de Región...>
- **Quién lo ejecuta:** <el GM activo (`isSoleExecutor`), el cliente que inició la acción o cada cliente>
- **Secuencia:** `archivo:línea` → `archivo:línea` → ...
- **Qué cambia:** <documentos y flags que escribe>

## Datos persistidos

Ver `baron.json` → `persisted`. Para cada flag, ajuste, slug o label de regla y roll option: qué guarda, dónde y por qué nunca se renombra.

## Puntos delicados

Concurrencia, ejecución única, envoltorios de internos de PF2e o Foundry, re-tiradas, migraciones y todo lo que se rompería en silencio.

## Qué se usa de baron-core

## API pública y para complementos

Resumen; el contrato completo está en `docs/API.md`.
