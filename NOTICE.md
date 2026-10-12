<!-- baron:template-only:start -->
# REVIEW BEFORE PUBLISHING — not legal advice

> **REVISAR ANTES DE PUBLICAR — esto no es asesoría legal.** Los textos de abajo se copiaron de las páginas oficiales de Paizo el 2026-10-10. Antes de cada publicación, vuelve a abrir la página citada en el bloque que aplica, compara el texto y, si cambió, usa el nuevo. Si hay dinero de por medio, consúltalo con un abogado.

> **Notas para el autor.** Todo lo que está entre marcadores `baron:template-only` es para ti y `tools/init-module.mjs` lo borra, junto con el bloque de la licencia que no elegiste: el `NOTICE.md` del módulo viaja en el ZIP de cada release, así que queda solo con la línea de título, los avisos de la licencia elegida y los campos por llenar. No le agregues notas de trabajo después. Esta guía sigue en la sección *Licencia y avisos legales* del README y en el `CLAUDE.md` del módulo, que no viajan en el ZIP.
<!-- baron:template-only:end -->
Avisos legales de **__TITLE__** (`__MODULE_ID__`). Este archivo dice qué material de terceros usa el módulo y bajo qué licencia; la licencia del **código** del módulo es otra decisión y está en `LICENSE`.

<!-- baron:template-only:start -->
La licencia de Paizo (`"paizo"` en `baron.json`) la decide el **proyecto completo**, no el precio de cada paquete. **Freemium:** si el proyecto tiene o tendrá una parte de pago, la base gratuita y el complemento de pago van **los dos** con la ORC License, porque la Community Use Policy prohíbe cualquier muro de pago en el proyecto; la base sigue siendo gratis y su código MIT. Un módulo bajo la Community Use Policy que gane un complemento de pago pasa a ORC antes de que el complemento se publique.
<!-- baron:template-only:end -->

<!-- baron:notice-cup:start -->
## Community Use Policy de Paizo

**Fuente:** https://paizo.com/licenses/communityuse (la página dice *Last Updated Thursday, August 22, 2024*; consultada el 2026-10-10).

<!-- baron:template-only:start -->
Para un módulo gratuito sin ninguna parte de pago. Qué implica, en resumen (lee la política completa en la fuente):

- El módulo tiene que ser **gratis para todos**: nada detrás de un muro de pago de ningún tipo, tampoco en un complemento aparte (para eso está la ORC: ver *Freemium* arriba). La política no nombra el acceso anticipado, pero nuestra lectura es que también lo prohíbe, igual que las versiones solo para mecenas. Las **donaciones** (Patreon, Ko-fi…) sí se permiten, siempre que el módulo siga siendo gratis para cualquiera.
- "Gratis" también significa sin trabas: no se puede exigir llenar encuestas, suscribirse a listas de correo ni descargar otros productos para obtener el módulo.
- El aviso de abajo va en una forma legible en el proyecto: en este archivo (enlazado desde el README; desde baron-core v1.1.1 viaja también en el ZIP de cada release) y en la descripción del paquete en foundryvtt.com.
- Hay que poner **información de contacto actualizada** en un lugar visible (abajo).
- No se puede decir ni dar a entender que Paizo respalda el módulo, ni alterar sus logos. Nada de contenido para adultos, ofensivo o inapropiado para menores.
- Hay que reproducir los avisos de copyright y marcas del material de Paizo que se use y, si ese material acredita a sus autores o artistas, también ese crédito. Lo que el módulo **lee en tiempo de ejecución** del sistema PF2e instalado no se copia; no metas texto ni íconos de los compendios en el módulo.
<!-- baron:template-only:end -->

### Aviso requerido (texto exacto, en inglés)

__TITLE__ uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo's Community Use Policy (paizo.com/licenses/communityuse). We are expressly prohibited from charging you to use or access this content. __TITLE__ is not published, endorsed, or specifically approved by Paizo. For more information about Paizo Inc. and Paizo products, visit paizo.com.

### Contacto

__AUTHOR__ — https://github.com/BaronHVC/__MODULE_ID__/issues
<!-- baron:notice-cup:end -->

<!-- baron:notice-orc:start -->
## ORC License

**Fuente:** https://paizo.com/orclicense (texto de la ORC License y su AxE; la página no muestra fecha de *last updated*; consultada el 2026-10-10). Registro: Library of Congress TX 9-307-067.

<!-- baron:template-only:start -->
Para módulos de pago, bases de un freemium y cualquier módulo que prefiera la ORC. Qué implica, en resumen (lee la licencia completa en la fuente):

- La Community Use Policy **no sirve** para un módulo de pago ni para la base gratuita de un freemium: prohíbe cualquier muro de pago en el proyecto. La ORC sí permite uso comercial, con cuatro avisos obligatorios (sección III, incisos a–d), puestos "de manera razonable" según el medio: aquí, en el README y en la página del paquete.
- La ORC **nunca** licencia marcas (la Community Use Policy sí permite usarlas, solo en proyectos gratuitos). "PF2e" o "Pathfinder" en el título o el id de un módulo bajo ORC, sea de pago o gratuito, es una **pregunta legal abierta**: decídelo antes de publicar (o pregunta a Paizo por escrito); el id no se puede cambiar después.
- La ORC cubre mecánicas del juego, no código: la licencia del código del módulo la decides tú.
- Lo que el módulo lee en tiempo de ejecución del sistema PF2e instalado no se redistribuye; no copies texto, arte ni íconos de los compendios al módulo.
- Rellena todo lo que está entre corchetes `[ ]` antes de publicar. Un campo que espera tu firma (una atribución por cotejar con el libro, una decisión legal) lleva una línea con `PENDIENTE:` y qué falta. Con un baron-core posterior a v1.2.0, `check-module` avisa de los dos en cada push y, con `--release` (el del release), falla.
<!-- baron:template-only:end -->

### ORC Notice

This product is licensed under the ORC License located at the Library of Congress at TX 9-307-067 and available online at various locations. All warranties are disclaimed as set forth therein.

### Attribution Notice

<!-- baron:template-only:start -->
> **Cómo llenarlo:** sigue el "Sample Notice" de la sección III de la licencia. Un renglón por cada obra ORC que use el módulo (por ejemplo Player Core o GM Core), incluidos los licenciantes de los que esa obra deriva: copia el título, el aviso de copyright y los créditos de autor tal como vienen en el aviso ORC de cada libro. En el último párrafo rellena el aviso de copyright del módulo (por ejemplo "© 2026").
<!-- baron:template-only:end -->

This product is based on the following Licensed Material:

[Title of Work], [Copyright Notice], [Author Credit Information].

If you use our Licensed Material in your own published works, please credit us as follows:

__TITLE__, [Copyright Notice], __AUTHOR__.

### Reserved Material Notice

Reserved Material elements in this product include, but may not be limited to: [nombres, logos, arte e identidad comercial de __TITLE__], and all elements designated as Reserved Material under the ORC License.

### Expressly Designated Licensed Material

The following elements are owned by the Licensor and would otherwise constitute Reserved Material and are hereby designated as Licensed Material: [ninguno].
<!-- baron:notice-orc:end -->
