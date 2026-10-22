# 03 · Interfaz visual (línea gráfica Apymsa)

> **Objetivo:** reproducir la apariencia exacta del módulo. Las medidas y colores
> de aquí son los del prototipo; no los «mejores» ni los redondees.

## Principios de layout

- La vista **ocupa todo el viewport** (`100vw × 100vh`) y **no se desplaza**: el
  documento tiene `overflow: hidden`. Quien se desplaza es **solo el cuerpo de la
  tabla**, dentro de su contenedor. Título, botonera, filtros, paginación,
  encabezados con buscadores y el pie permanecen fijos.
- Tipografía **Arial** (con respaldo del sistema). **12 px** en todo, salvo: menú
  lateral 16 px (15 px ≤1280 px, 13 px ≤1024 px), título `Productos OEM` 19 px
  negrita, título de ventanas modales 14 px, toasts 14 px.
- Cajas con `box-sizing: border-box`. Esquinas **rectas** en todo el módulo,
  excepto los botones de ventanas modales (4 px), el botón de lápiz (3 px) y el
  interruptor.

## Paleta

| Uso | Color |
| --- | --- |
| Azul corporativo (encabezados de tabla/modal, botones primarios, página activa del select) | `rgb(0,75,131)` `#004B83` |
| Azul primario hover / active | `rgb(0,60,106)` / `rgb(0,48,85)` |
| Azul «Filtrar» | `rgb(0,113,179)` `#0071B3`; hover `rgb(0,96,152)`; active `rgb(0,82,130)` |
| Verde «Descargar plantilla» | `rgb(74,186,127)`; hover `rgb(60,166,110)`; active `rgb(50,146,95)` |
| Menú lateral fondo / hover | `rgb(47,51,55)` / `rgb(62,67,72)` |
| Título de sección del menú | `rgb(0,80,128)`, filo `0 0 0 1px #000` |
| Gris deshabilitado (reservado) | `rgb(211,211,211)` |
| Gris página actual | `rgb(150,150,150)` |
| Fila par / impar | `rgb(255,255,255)` / `rgb(246,246,246)` |
| Registro recién agregado/editado | `rgb(226,242,232)` (dura 4 s) |
| Ámbar «Editar» | `rgb(218,161,37)`; hover `rgb(196,142,28)`; active `rgb(174,125,22)` |
| Interruptor apagado / encendido | `rgb(190,190,190)` / `rgb(0,75,131)` |
| Botón modal «cancel» | `#D9534F` (hover `rgb(196,68,64)`) |
| Botón modal «save» | `#60BA7C` (hover `rgb(80,166,106)`); deshabilitado `#95D195` |
| Campo de solo lectura | fondo `rgb(238,238,238)`, texto `rgb(60,60,60)` |
| Campo inválido | borde `rgb(200,70,70)`, fondo `rgb(253,240,240)` |
| Borde de campo de formulario | `rgb(190,190,190)`; enfocado `rgb(0,75,131)` |
| Leyenda de error (pie de ventana) | `rgb(160,40,40)` |

## Menú lateral

Ancho **204 px** (173 px ≤1280, 162 px ≤1024), fondo `rgb(47,51,55)`, columna
con logotipo arriba, navegación y pie abajo. Logotipo en una franja de 82 px.
Título de sección `Gestión` (alto 35 px, 16 px negrita blanco, fondo azul
`rgb(0,80,128)`). Ítem activo `Productos OEM`: alto 42 px, **fondo blanco** y texto
azul `rgb(0,80,128)`. Pie: `© 2026 - Administrador operaciones` y `Versión
3.0.0.8`, centrados, blanco, 16 px. Si el alto no alcanza, el menú tiene su propio
scroll (barra fina gris oscuro).

## Contenido

Relleno `35px 40px 40px 22px` (≤1500: `28 28 30 20`; ≤1280: `22 20 24 16`; alto
≤720: arriba/abajo 20). Orden vertical:

1. **Cabecera**: `h1` `Productos OEM` a la izquierda; a la derecha, icono de
   usuario + `Cerrar sesión` (12 px negro; en hover pasa a azul).
2. **Botonera** (35 px bajo la cabecera, separación 10 px): a la izquierda
   `Exportar` y `Importar` (azul primario) y `Descargar plantilla` (verde); al
   extremo derecho `Bitácora` y `Agregar equivalencia +` (azul primario).
3. **Filtros** (26 px bajo la botonera), `flex-wrap`, separación `12px 16px`:
   `U. de M.:` · `Tipo:` · `Alcance:` · `Estatus:` (etiqueta negrita 12 px a la
   izquierda del desplegable, 9 px de separación), después el par `Filtrar` +
   borrador (8 px entre ambos) y, **al extremo derecho**, la paginación. Si la fila
   no cabe, **solo la paginación baja de renglón**.
4. **Tabla** (20 px bajo los filtros), ocupa el alto restante.
5. **Pie**: `Registros por página:` + desplegable (64 px de ancho, alto 20 px,
   esquinas 2 px) que se abre **hacia arriba**.

### Botones

`.btn`: relleno `11px 20px`, sin borde, texto blanco 12 px, transición de fondo
0.15 s. Todos rectos. `Filtrar` usa relleno `10px 20px`. **Botón de borrador**:
solo icono (goma de borrar, SVG blanco 15 px), cuadrado 34×34, relleno 8 px,
mismo azul que `Filtrar`. Deshabilitado: fondo gris reservado, `cursor:
not-allowed`, sin hover.

### Desplegable (select personalizado)

No se usa el `<select>` nativo. Disparador: fondo blanco, **contorno negro de 1 px
interior**, relleno `7px 10px`, texto 12 px, flecha a la derecha (triángulo que
gira al abrir). Ancho de los cuatro filtros: **124 px** (116 px ≤1280), el justo
para `No disponible`. Menú: aparece 2 px debajo (o arriba con `--up`), mismo ancho
mínimo, borde negro 1 px, sombra `0 2px 6px rgba(0,0,0,.2)`, `z-index` 40,
**`max-height` 155 px (≈5 opciones) con scroll interno**. Opción: relleno
`7px 10px`; hover `rgb(240,244,248)`; **seleccionada: fondo azul `rgb(0,75,131)`,
texto blanco**. Se cierra al elegir, al hacer clic fuera o con `Esc`.

Dentro de formularios el disparador cambia a **borde gris** (`rgb(190,190,190)`,
sin el contorno negro) y relleno `6px 10px` para igualar la altura de los
campos de texto (28 px).

### Paginación

Fila de botones cuadrados **30×30** con 8 px de separación, texto blanco 12 px:

| Botón | Color |
| --- | --- |
| `<` `>` con destino, números | azul `rgb(0,75,131)` (hover `rgb(0,60,106)`) |
| Página actual | gris `rgb(150,150,150)`, sin acción |
| `<` en la página 1, `>` en la última | gris reservado `rgb(211,211,211)`, `not-allowed` |
| `...` | texto gris `rgb(150,150,150)` |

### Tabla

CSS Grid de **10 columnas**:
`minmax(0,1fr)` Código · `0.7fr` U. de M. · `1fr` Proveedor · `0.55fr` Tipo ·
`1fr` Código proveedor · `1fr` Alcance · `0.8fr` Empaque · `0.55fr` Cantidad ·
`0.5fr` Estatus · `0.5fr` Acciones (todas `minmax(0, …)` para que un valor largo
**continúe en el siguiente renglón** en vez de ensanchar la columna).

- Encabezado: **pegajoso** (`sticky; top:0`), alto mínimo 38 px, azul, filo
  blanco `0 0 0 1px #fff`, texto blanco 12 px centrado, `z-index` 3.
- Fila de buscadores: pegajosa justo debajo (`top: 38px`), alto 30 px, azul, relleno
  4 px; la caja es gris claro `rgb(246,246,246)`, texto centrado, *placeholder*
  `Buscar` en `rgb(211,211,211)`. Solo en `Código`, `Proveedor` y `Código proveedor`.
- Encabezados ordenables: cursor mano, hover `rgb(0,60,106)`, **dos flechas**
  (ascendente/descendente); la del sentido activo a plena opacidad y la otra al
  30 %.
- Celda: relleno `10px 8px`, centrada, `overflow-wrap`/`word-break` para romper
  valores largos. Filas alternan blanco / `rgb(246,246,246)`.
- Contenedor con `scrollbar-gutter: stable`, `overflow-y: auto`, `overflow-x:
  hidden`.
- Sin coincidencias: una celda de ancho completo con aviso en gris
  `rgb(120,120,120)`.

### Interruptor de `Estatus`

34×18 px, redondeado (9 px). Apagado `rgb(190,190,190)`; encendido
`rgb(0,75,131)`. Perilla blanca 14 px con sombra, recorre 16 px. Hover: brillo
0.94. Foco visible: contorno azul 2 px.

### Botón de lápiz (`Acciones`)

26×26 px, ámbar `rgb(218,161,37)`, esquinas 3 px, icono de lápiz **relleno** blanco,
sugerencia `Editar`.

## Ventanas modales

- **Fondo** `rgba(0,0,0,.5)`, `position: fixed; inset: 0; z-index: 300`.
- **Anclada por arriba** (no centrada en vertical) para que todas abran a la misma
  altura: relleno superior `clamp(60px, 16vh, 220px)`, lateral 24 px, inferior
  40 px. Si el fondo no cabe, **el fondo hace scroll**.
- **Variante «subida»** (`--raised`): relleno superior `clamp(16px, 4vh, 40px)`,
  inferior 20 px. Solo se aplica **cuando el contenido no cabe** (ver `07`).
- Ventana: ancho `min(612px, 100%)` (formulario/confirmación), `wide`/`xwide`
  hasta **1340 px** para tablas; fondo blanco, sombra `0 6px 24px rgba(0,0,0,.35)`.
- Cabecera azul, relleno `14px 20px`, título 14 px blanco peso 400, `X` de cierre
  a la derecha (opacidad .9 → 1 en hover).
- Cuerpo: relleno `24px 20px`, **`overflow: visible`** (los desplegables se
  superponen al pie, no provocan scroll interno).
- Pie: botones a la derecha, separación 10 px, relleno `0 20px 20px`. Botones de
  ventana: relleno `7px 16px`, esquinas 4 px; **conservan su tamaño al
  deshabilitarse**. Un control *aside* (p. ej. «Registros por página») ocupa el
  hueco izquierdo del pie.

### Campos de formulario

Rejilla de **6 columnas** con separación `12px 16px`; los campos ocupan 2, 3, 4 o 6
columnas. Etiqueta arriba (12 px negro, 6 px de separación). Campo de texto: alto
**28 px**, relleno `5px 10px`, borde gris 1 px, enfocado con contorno azul 1 px.
Solo lectura: gris (`rgb(238,238,238)`), sin contorno de foco. Desplegable
bloqueado (`--locked`): mismo gris y **sin flecha**.

### Sugerencias (autocompletado)

Menú bajo el campo, ancho `max-content` (mín. 100 %, máx. 420 px), borde negro 1 px,
sombra, **`max-height` 150 px (5 sugerencias) con scroll**. Cada sugerencia
muestra «código · nombre».

### Toast

Fijo a **50 px** del borde superior y del izquierdo, **320 px de ancho** (crece a lo
alto), relleno `16px 20px`, contorno negro 2 px, texto blanco 14 px centrado,
`z-index` 400 (sobre las ventanas). Entra **deslizándose en horizontal desde fuera
del borde izquierdo**, a la misma altura siempre (transición 0.45 s), permanece
**4 s** y sale por el mismo camino. Colores al 90 % de opacidad: `error`
`rgba(217,83,79,.9)`, `success` `rgba(96,186,124,.9)`, `warning`
`rgba(218,161,37,.9)`.

## Previsualización de importación y bitácora (estilos propios)

Tabla de ventana: encabezado azul, filas alternas, celdas centradas. Alto máximo
de la tabla: **30 vh** (previsualización) y **42 vh** (bitácora); el excedente
hace scroll interno con encabezado fijo. Filas de incidencia: **error** sobre
`rgb(253,240,240)`, **aviso** sobre `rgb(253,248,235)`. Panel de estado:

| Estado | Fondo | Borde | Texto |
| --- | --- | --- | --- |
| Limpia | `rgb(240,249,243)` | `rgb(74,186,127)` | `rgb(40,105,68)` |
| Con avisos | `rgb(253,248,235)` | `rgb(218,161,37)` | `rgb(125,88,12)` |
| Fallida | `rgb(253,240,240)` | `rgb(200,70,70)` | `rgb(160,40,40)` |

Bitácora: acción en color — `Alta` verde `rgb(60,130,85)`, `Edición` ámbar
`rgb(150,110,20)`, `Baja` rojo `rgb(160,40,40)`, `Reactivación` azul
`rgb(0,75,131)` (todas en negrita); valor anterior en gris `rgb(110,110,110)`;
entradas de una carga masiva con fondo `rgb(240,246,251)` y filo superior azul
`rgb(0,113,179)` 2 px en la primera del bloque.

## Criterios de aceptación

- [ ] Ningún scroll de página en 1280×720, 1366×768, 1440×900 y 1920×1080; solo
      scrollea el cuerpo de la tabla.
- [ ] Encabezado y fila de buscadores permanecen fijos al desplazar (comprobar
      que el borde superior queda pegado al del contenedor).
- [ ] Todo texto mide 12 px salvo las excepciones listadas.
- [ ] Un valor largo en una celda continúa en otra línea sin ensanchar la columna.
- [ ] Con 1366 px los cuatro filtros + botones caben en una línea o la paginación
      baja sola, sin desbordar.
- [ ] Los desplegables largos muestran ~5 opciones y hacen scroll.
