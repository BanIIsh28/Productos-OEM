# 08 · Bitácora de cambios

> **Objetivo:** que **toda** alta, edición, baja y reactivación deje rastro
> consultable, filtrable, paginado y descargable, y que se sepa **de dónde vino**
> cada cambio (captura manual o carga por archivo). Depende de `05`, `06`, `07`.

## Regla de oro: una sola puerta

Las **únicas** funciones del módulo que modifican un registro son:

| Función | Qué hace | Anota |
| --- | --- | --- |
| `commitAlta(fila)` | inserta la fila **al principio** del catálogo | `Alta` |
| `commitEdicion(fila, valores)` | aplica los nuevos valores campo por campo | `Edición`, **una entrada por campo cuyo valor cambió** |
| `commitEstatus(fila, activo)` | cambia el estatus | `Baja` o `Reactivación` |

Cada una anota **en el mismo paso** en que aplica el cambio. No existe «modificar
y luego anotar»; por eso el rastro no depende de que quien llama se acuerde. Todo
camino que cambie datos pasa por aquí: el alta desde el formulario, el alta de
cada fila de una carga masiva, la edición desde el lápiz y el interruptor de
`Estatus`.

`commitEdicion` compara con `String(anterior) === String(nuevo)`; sin cambios reales
**no** hay entradas (y devuelve cuántos campos cambiaron).

## La entrada

| Campo | Contenido |
| --- | --- |
| `fecha` | instante del cambio |
| `usuario` | identificador de **máximo 5 dígitos** (en el prototipo, el de la sesión: `10345`; el historial simulado reparte `10345, 10412, 20877, 31056, 40923, 7218`) |
| `sku` (Código) | código de producto del registro |
| `proveedor` | proveedor del registro **en ese momento** |
| `accion` | `Alta` · `Edición` · `Baja` · `Reactivación` |
| `origen` | `Manual` \| `Archivo` |
| `operacionId` | `null` si es manual; `CARGA-00N` si vino de una carga masiva |
| `campo` | qué cambió |
| `anterior` / `nuevo` | valores antes y después |

| Acción | `campo` | `anterior` | `nuevo` |
| --- | --- | --- | --- |
| `Alta` | `Registro completo` | vacío | los 8 datos en una línea: `código · proveedor · tipo · código proveedor · alcance · empaque · cantidad · Activo/Inactivo` |
| `Edición` | el campo que cambió (`Código`, `Proveedor`, `Tipo`, `Código proveedor`, `Alcance`, `Empaque`, `Cantidad`) | su valor antes | su valor después |
| `Baja` | `Estatus` | `Activo` | `Inactivo` |
| `Reactivación` | `Estatus` | `Inactivo` | `Activo` |

`U. de M.` **nunca** aparece: no es dato de la equivalencia. Una edición que toca
tres campos deja tres entradas.

## Origen y operación (de dónde vino)

- `origen` y `operacionId` los **pone el contexto**, no quien anota: mientras corre
  una carga masiva, `comoCargaDeArchivo(fn)` abre una *operación* (`CARGA-001`,
  `CARGA-002`…, contador creciente), y **todo lo que se anote dentro** se marca
  `Archivo` con ese identificador; al terminar —aunque falle (`try/finally`)— la
  marca se libera. **Fuera de ese contexto, toda entrada es `Manual`.**
- Una carga con 60 altas son 60 entradas con **el mismo** `operacionId`: se lee
  como una sola operación, no como 60 capturas sueltas.
- El historial simulado trae **tres cargas previas** (`CARGA-001` a `003`), de modo
  que la primera carga real del demo es `CARGA-004`.

## Historial simulado de arranque (solo demo)

Para que la vista tenga contenido: para **cada** uno de los 183 registros, un `Alta`
con fecha entre 30 y 150 días atrás y usuario al azar; después:

- ~25 % recibió una `Edición` posterior de un campo editable (en un `Producto` solo
  `Proveedor` o `Código proveedor`: nadie edita lo implícito; en `Presentación`
  también `Empaque` o `Cantidad`);
- ~17 % un cambio de estatus (`Baja`/`Reactivación`) que **dejó el estado actual**.

Tres cargas masivas simuladas: grupos contiguos de 4–9 registros, a 20, 45 y 70
días atrás, con las altas separadas 1 s y el mismo usuario. **Ninguna fecha
posterior al alta puede caer en el futuro** (se topa con «ahora»). Se ordena todo
cronológicamente. **Invariante:** el valor nuevo de la última entrada de cada campo
**coincide con lo que la tabla muestra hoy**.

En el sistema destino la bitácora es **persistente y de solo anexar**; esto es
únicamente relleno de demo.

## Ventana `Bitácora de cambios`

Botón `Bitácora` (a la izquierda de `Agregar equivalencia +`). Ventana **extra
ancha** (hasta 1340 px).

**Fila superior:** a la **izquierda**, dos campos cortos de solo lectura —
`Entradas` (total) y `Mostradas` (tras los filtros)— y, **al extremo opuesto en la
misma fila**, la paginación (mismo componente que `04`). *No* hay campo de «usuario
en sesión».

**Tabla** (CSS Grid, fracciones): `Fecha y hora 1.05 · Usuario 0.6 · Código 0.7 ·
Proveedor 1.45 · Acción 0.85 · Origen 0.95 · Campo 1 · Valor anterior 1.6 · Valor
nuevo 2`. Orden: **de lo más reciente a lo más antiguo**. Un valor vacío se muestra
`—`. Alto máximo **42 vh** y scroll interno con encabezado y fila de buscadores
fijos (la ventana mide lo mismo con 25 que con 100 registros por página).
Proveedor, valor anterior y valor nuevo alinean a la izquierda; el resto centrado.

**Buscadores** (misma mecánica que la tabla principal: `Enter`, **mínimo 3
caracteres**, vaciar quita el filtro, sin acentos ni mayúsculas, campo rojo si es
corto): `Fecha y hora`, `Usuario`, `Código`, `Proveedor`, `Origen`. **Los cinco se
combinan (Y).** La fecha se busca sobre su texto `dd/mm/aaaa hh:mm`, así que
`09/2026` acota un mes y `04/09` un día. Vacío: `No se encontraron entradas con los
filtros aplicados`. Cambiar de filtro → página 1. Cambiar de página devuelve el scroll
de la tabla al principio.

**Columna `Origen`:** muestra `Manual` o `Archivo`; en `Archivo`, **debajo** va el
`CARGA-00N` en letra pequeña gris (10 px). Las entradas de una misma carga se
**agrupan visualmente**: fondo `rgb(240,246,251)` y, en la primera del bloque, un filo
superior azul de 2 px. *Primera del bloque* = la que tiene `operacionId` y la
entrada anterior **en la página** no tiene el mismo (el historial va ordenado, así
que las de una carga son contiguas).

**Pie:** a la **izquierda**, `Registros por página` (25, 50, 75, 100; se abre hacia
arriba; por defecto 25) a la altura de los botones; a la **derecha**, `Descargar`
(verde) y `Cerrar` (rojo). **Filtros y tamaño de página se conservan al cerrar y
reabrir** la ventana.

## Descarga

`Descargar` baja a `.xlsx` **las entradas que la consulta está mostrando** (con los
filtros aplicados, **no** el historial entero) en `Bitacora-Productos-OEM_<aaaammdd>-
<hhmm>.xlsx`, hoja `Bitacora`: las **9 columnas de la vista** más una décima,
**`Operación`** (`CARGA-00N` o vacío). `Usuario` y `Código` como **texto**; la fecha
como texto `dd/mm/aaaa hh:mm`; valor anterior vacío como celda vacía (no `—`).
Toast éxito `Se descargó {archivo} con N entrada(s)`; sin entradas, warning `No hay
entradas que descargar con los filtros aplicados`. **La ventana no se cierra** (el
`onClick` devuelve `false`): descargar es un paso más de la consulta.

## Criterios de aceptación

- [ ] Dar de alta una equivalencia genera una entrada `Alta · Registro completo ·
      Manual` con los 8 datos en el valor nuevo.
- [ ] Editar tres campos genera **tres** entradas `Edición`; editar sin cambiar nada
      no genera ninguna.
- [ ] El interruptor genera `Baja`/`Reactivación` con `Estatus` y los valores
      correctos, **solo tras `Aceptar`**.
- [ ] Una carga masiva de N filas nuevas genera N altas `Archivo` con **el mismo**
      `CARGA-00N`; una segunda carga usa el siguiente número.
- [ ] Un alta manual posterior es `Manual` (no hereda la marca de la carga).
- [ ] Si algo falla dentro de `comoCargaDeArchivo`, el contexto se libera igual.
- [ ] No existe ninguna ruta que cambie un registro sin pasar por `commit*`
      (buscar asignaciones directas al registro).
- [ ] Filtrar `Origen = Archivo` + descargar → el `.xlsx` trae exactamente las filas
      filtradas, con `Operación`.
- [ ] El usuario nunca excede 5 dígitos.
- [ ] El valor nuevo de la última entrada de cada campo coincide con la tabla.
