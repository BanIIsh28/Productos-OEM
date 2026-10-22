# 07 · Excel: plantilla, exportación e importación con previsualización

> **Objetivo:** descargar plantilla, exportar la tabla y **cargar equivalencias en
> lote** con validación completa y una previsualización que explique cada
> incidencia antes de tocar el catálogo. Depende de `05` (ventanas) y `06`
> (reglas).

## Archivos y nombres

| Acción | Botón | Archivo | Contenido |
| --- | --- | --- | --- |
| Plantilla | `Descargar plantilla` | `Plantilla-Productos-OEM.xlsx` | encabezados + **una fila de ejemplo válida**; siempre idéntica, sin importar los filtros |
| Exportar | `Exportar` | `Productos-OEM_<aaaammdd>-<hhmm>.xlsx` | los registros que la tabla está mostrando: **filtros y orden vigentes** (incluido el `Estatus` inicial) |
| Bitácora | `Descargar` (ver `08`) | `Bitacora-Productos-OEM_<aaaammdd>-<hhmm>.xlsx` | entradas filtradas |

**Todos** los archivos del módulo usan **una sola hoja llamada exactamente
`Carga_Equivalencias`** (la bitácora usa `Bitacora`), de modo que descargar y volver
a cargar funcione sin retocar nada.

**Columnas del archivo (8, en este orden y con este texto):** `Código`, `Proveedor`,
`Tipo`, `Código proveedor`, `Alcance`, `Empaque`, `Cantidad`, `Estatus`.
**`U. de M.` y `Acciones` no viajan** (la unidad es calculada y no se persiste).

Fila de ejemplo de la plantilla (pasa la propia validación del módulo): `1001000 ·
Robert Bosch México · GS1 · 07501234567893 · Presentación · Caja máster · 12 ·
Activo`.

Toasts: exportación `Se descargó {archivo} con N registro(s)` (éxito); sin filas
`No hay registros que exportar con los filtros aplicados` (warning); plantilla `Se
descargó {archivo} con los encabezados y una fila de ejemplo`.

### Escritura del `.xlsx`

Requisitos (independientemente de la librería): encabezado en **negrita blanca
sobre `#004B83`**; anchos de columna razonables (prototipo: `12, 32, 10, 20, 16,
14, 11, 11`); `Estatus` como texto `Activo`/`Inactivo`; **`Código proveedor`
siempre como celda de texto** (un GTIN con ceros a la izquierda o un código largo
perdería ceros o acabaría en notación científica si se emitiera como número). En
el prototipo `Código` y `Cantidad` se emiten numéricos (7 dígitos sin ceros
iniciales y enteros); si tu librería lo permite, emitirlos como texto es más
seguro y no cambia nada para el lector.

*(El prototipo escribe el OOXML a mano — ZIP «store» + CRC32 — porque no admite
dependencias. En destino usa la librería estándar del stack.)*

## Lectura del `.xlsx` — requisitos

`readXlsx(archivo, nombreHoja)` → `{ encontrada, hojas, filas, formulas }`:

- **Resuelve la hoja por su nombre visible**, cruzando `xl/workbook.xml` con
  `xl/_rels/workbook.xml.rels` (`r:id` ↔ `Target`). **No toma «la primera hoja»**.
  Si no existe, `encontrada = false` y se rechaza sin adivinar otra.
- Devuelve `filas` (matriz de celdas como texto) y un arreglo **paralelo**
  `formulas` que dice qué celdas son **fórmulas**, mirando si el XML de la celda
  trae `<f>`. (Excel escribe `<f>` en las celdas calculadas.)
- Una celda numérica se toma con **el texto literal del valor** del XML (sin
  formatear); los textos compartidos e *inline* se resuelven.
- Las celdas con **texto literal** que empiece por `=`, `+`, `-` o `@` **no llevan
  `<f>` y no son fórmulas**: un código propietario puede empezar así legítimamente.

## Flujo del botón `Importar`

1. **Ventana `Importar archivo`:** texto `Seleccione el documento que desee
   cargar.`, selector limitado a `.xlsx` y botón `Guardar`, **deshabilitado (verde
   claro) hasta elegir archivo**. Al pulsar: el botón pasa a `Revisando…`.
2. Se lee el archivo y se revisa completo.
3. Se abre la **previsualización**. **Nada se aplica al catálogo hasta pulsar
   `Continuar`.**

## Validaciones estructurales (VAL-EST) — rechazan el archivo entero

Se comprueban **antes** de mirar fila por fila, **en este orden**; el primer fallo
termina la revisión (la ventana acaba en el mensaje, sin tabla):

| # | Código | Regla |
| --- | --- | --- |
| 1 | `VAL-EST-001` | La hoja debe llamarse **exactamente** `Carga_Equivalencias` |
| 2 | `VAL-EST-007` | Más de **50 000** filas útiles (se revisa **antes** de validar filas, para no gastar tiempo) |
| 3 | `VAL-EST-002` | Columnas distintas de las 8 de la plantilla: mismas, **mismo texto, mismo orden**, sin faltantes, repetidas, renombradas, reordenadas ni de más. (Se toleran celdas vacías sobrantes **a la derecha** del encabezado.) |
| 4 | `VAL-EST-003` | Ninguna fila útil bajo los encabezados |

*Fila útil* = fila bajo el encabezado con **al menos una celda con contenido**
(tras recortar espacios); las vacías no cuentan. El número de fila que se muestra
es el **número real de la hoja** (1 = encabezado, la primera de datos es la 2).

Mensajes: `VAL-EST-002` dice qué falla (`La hoja tiene N columnas y se esperan 8:
…` o `La columna K es "X" y se espera "Y"`). `VAL-EST-007`: `El archivo trae N filas
útiles y el máximo es 50,000`. `VAL-EST-003`: `La hoja Carga_Equivalencias no
tiene ninguna fila debajo de los encabezados`. El panel final muestra `RES-VAL-002 ·
VALIDACIÓN FALLIDA — {código} · {mensaje}. {corrección}`.

## Validación por fila (orden dentro de cada fila)

Cada celda se **recorta** (`trim`). Una columna muestra su **primer** fallo; la lista
de incidencias recoge **todos**. Un `ERROR` en la fila la clasifica *con error*.

| Columna | Comprobación, en orden |
| --- | --- |
| Código | vacío → `VAL-EST-004` · no numérico → `VAL-EST-005` · no existe en el catálogo → `VAL-MAE-001` |
| Proveedor | vacío → `VAL-EST-004` · no registrado → `VAL-MAE-002` (comparación sin acentos ni mayúsculas) |
| Tipo | vacío → `VAL-EST-004` · distinto de `GS1`/`No GS1` → `VAL-EST-005` |
| Código proveedor | **fórmula** → `VAL-EST-006` · vacío (o solo espacios) → `VAL-EST-004` · **más de 50 caracteres (ya recortado)** → `VAL-EST-005` · no cumple la norma de su tipo → `VAL-GS1-002/003/004/005` según el motivo · correcto → se guarda en **forma canónica** |
| Alcance | vacío → `VAL-EST-004` · distinto de `Producto`/`Presentación` → `VAL-EST-005` |
| Empaque / Cantidad | con `Producto`: vacíos se **completan** (`Unidad`, `1`); si traen otro valor → `VAL-EMP-001`. Con `Presentación`: vacío → `VAL-EST-004`; empaque inválido o cantidad inválida → `VAL-EMP-002`. Sin alcance utilizable, la regla no se aplica |
| Estatus | vacío → `VAL-EST-004` · distinto de `Activo`/`Inactivo` → `VAL-EST-005` |

La previsualización muestra **ya el valor completado** (p. ej. `Unidad`/`1` en una
fila `Producto` que venía vacía).

Después se aplica la **unicidad** (`06`) y, por último, la **clasificación**
(nueva / sin cambio / con aviso / con error).

## Previsualización

Ventana ancha con título `Previsualización del archivo`.

1. **Encabezado, un solo renglón de ocho campos de solo lectura:** `Archivo`
   (nombre), `Fecha` (`dd/mm/aaaa hh:mm`), `Usuario` (el simulado, el mismo que
   estampa la bitácora), `Filas útiles`, `Nuevas`, `Sin cambio`, `Con aviso`, `Con
   error`. **La suma de los cuatro contadores es siempre el total.** El total es el
   **real** del archivo, no el de la página visible.
2. **Panel de estado** con uno de tres estados (colores en `03`):

| Situación | Estado | Mensaje | ¿`Continuar`? |
| --- | --- | --- | --- |
| Todo nueva/sin cambio | `RES-VAL-001 · VALIDADA` | `No se detectaron incidencias en el archivo. Puedes continuar con la carga.` | Sí |
| Hay avisos, cero errores | `RES-VAL-001 · VALIDADA` | `Se detectaron N incidencia(s), ninguna bloqueante. Puedes continuar con la carga.` | Sí |
| ≥ 1 error | `RES-VAL-002 · VALIDACIÓN FALLIDA` | `N fila(s) tiene(n) una incidencia bloqueante. Corrige el archivo y vuelve a intentar el proceso: no es posible cargar los registros mientras haya un solo error.` | **No** |

   Lo que habilita `Continuar` es la **ausencia de errores**, no de incidencias.
3. **Filtros combinables** (cada uno con `Todos` por omisión y armado **con los
   valores que de verdad aparecen en el archivo**): **`Tipo error`**, **`Columna
   afectada`** (nombre de columna o `Toda la fila`), **`Severidad`**. A la derecha, la
   paginación (mismo componente que en `04`).
   - `Tipo error` muestra **código + alias** (`VAL-GS1-003 · Dígito verificador GS1
     inválido`), mide **430 px**, cede si la fila se estrecha y su lista se
     ensancha para no cortar alias. **Orden de opciones:** por **filas afectadas
     descendente**; a igualdad `ERROR` antes que `INFORMACION`; luego por código.
   - Etiqueta **al lado** del desplegable (no encima).
4. **Tabla de incidencias** — columnas `Fila · Código · Proveedor · Tipo · Código
   proveedor · Alcance · Empaque · Cantidad · Estatus · Detalle`:
   - **Solo lista las filas con aviso o con error.** Las que no tienen incidencia
     únicamente se cuentan en el encabezado; si no hay ninguna, la tabla lo dice.
   - El **dato concreto afectado va recuadrado** (con código y mensaje en su
     ayuda); `Detalle` muestra código + mensaje de **cada** incidencia, con la
     corrección recomendada en la ayuda.
   - Fondo rojizo para filas con error; ámbar para las que solo traen aviso.
   - **`Fila` y `Detalle` ordenan** (por número de fila y por código de incidencia)
     con las flechas del catálogo. Filtrar u ordenar → página 1.
   - Alto máximo **30 vh**; el exceso hace scroll **interno** con encabezado fijo.
5. **Pie:** a la izquierda `Incidencias por página` (25/50/75/100; solo si hay
   incidencias). Botones: **`Cancelar`** (o **`Cerrar`** si falló) y, solo si no
   falló, **`Continuar`** (verde).

**Posición de la ventana:** por defecto abre a la misma altura que las demás. Tras
renderizar, **solo si no cabe** (alto de la ventana > alto disponible del fondo)
se aplica la variante *subida* (`--raised`, ver `03`). Una previsualización corta
(sin incidencias, rechazo estructural) abre a la misma altura que el resto.

## `Continuar` — qué se aplica

Se agregan **solo las filas `nueva`**, **al principio de la tabla**, en el orden del
archivo, **todas dentro de una sola operación de bitácora** (`CARGA-00N`, `08`).
Las `sin cambio` y `con aviso` **no tocan el catálogo ni dejan entrada**. Después:
se retira el orden, página 1 y se repinta.

Toasts:

| Caso | Toast |
| --- | --- |
| Hay filas nuevas, todas visibles | éxito `Se aplicó el archivo: N equivalencia(s) nueva(s)` + ` (A sin cambio y B con aviso)` si hubo omitidas |
| Hay filas nuevas y **alguna queda fuera de la vista** por los filtros | **warning** `…, aunque la del código X no se muestra con los filtros aplicados` (una oculta) / `…, aunque N no se muestran con los filtros aplicados` (varias) |
| Ninguna fila nueva | warning `El archivo se aplicó sin cambios: ninguna fila era nueva` + omitidas |

Caso típico: la tabla arranca con `Estatus = Activo`; una fila nueva con `Estatus =
Inactivo` en el archivo **sí se carga** pero no se ve. El toast lo dice para no
dejar al usuario buscando un registro que sí existe. Para decidirlo se guarda la
referencia de cada fila insertada y, **tras repintar**, se comprueba cuáles siguen
en `filteredRows()` (el mismo criterio que el alta manual).

## Archivos de ejemplo (`ejemplos/`)

- **`Importar-correctos.xlsx`** — 5 filas válidas que cubren: 2 `Producto` (una con
  `Unidad`/`1` escritos y otra con esas celdas vacías), 3 `Presentación` (`Inner`,
  `Caja máster`, `Pallet`); 3 `GS1` (13 dígitos, el mismo en 14 con su cero, y 12)
  y 2 `No GS1`. **Una de las cinco (código `1175731`) viene `Inactivo`** a propósito
  (demuestra el aviso de fila oculta). Códigos: `1001000, 1023711, 1054701,
  1175731, 1256613`. Resultado: `RES-VAL-001 · VALIDADA`, `Nuevas = 5`.
- **`Importar-incompletos.xlsx`** — 20 filas: 18 con error y 2 sin incidencia; el
  archivo se rechaza completo. Una incidencia clara por fila: 2 `VAL-EST-004`
  (código vacío) · 3 `VAL-MAE-001` (9999999) · 4 `VAL-MAE-002` (proveedor inventado)
  · 5 `VAL-GS1-003` · 6 `VAL-GS1-002` (11 dígitos) · 7 `VAL-GS1-004` · 8 `VAL-GS1-005` ·
  9 `VAL-EMP-001` · 10 `VAL-EMP-002` (`Unidad` y 0) · 11 `VAL-EST-005` (51 caracteres)
  · 12 `VAL-EST-006` (fórmula `=A1`) · 13-14 `VAL-UNI-001` · 15-16 `VAL-UNI-003`
  (**entre sí**, dentro del archivo) · 17-18 `VAL-UNI-004` · **19 `VAL-UNI-003` contra
  el catálogo**: GTIN `07500001234563` con alcance `Producto`, que choca con la **fila
  ancla** (`1001293`, Robert Bosch México, `Presentación · Caja máster · 24`) · 20-21
  CF-51775-29 (dos `No GS1`, mismo código, proveedores distintos: **sin incidencia**,
  cuentan como `Nuevas`).
- La fila ancla (`02`) existe **para que la fila 19 sea reproducible** en cualquier
  sesión.

## Criterios de aceptación

- [ ] La plantilla descargada se importa **tal cual** y da `VALIDADA`, 1 nueva.
- [ ] Exportar y volver a importar el resultado no da errores estructurales.
- [ ] Una hoja renombrada → `VAL-EST-001`, sin adivinar otra. Una columna de más, de
      menos o reordenada → `VAL-EST-002`. Solo encabezado → `VAL-EST-003`. 50 001
      filas → `VAL-EST-007` **sin** revisar las filas.
- [ ] Celda con fórmula `=A1` → `VAL-EST-006`; la misma cadena como **texto** no.
- [ ] Código proveedor de solo espacios → `VAL-EST-004` (no `-005`); de 51
      caracteres → `VAL-EST-005`.
- [ ] `Importar-correctos.xlsx` → `Nuevas=5`, sin incidencias, `Continuar` visible;
      con `Estatus=Activo` el toast final es **ámbar** y nombra `1175731`; con
      `Todos` es verde y aparecen las 5.
- [ ] `Importar-incompletos.xlsx` → `VALIDACIÓN FALLIDA`, 18 filas con error, sin
      `Continuar` (el botón dice `Cerrar`). Al filtrar `Tipo error = VAL-UNI-003`
      salen **tres filas: 15, 16 y 19**; el detalle de la 19 dice `El GTIN ya está
      en el catálogo con otro destino: código 1001293, Presentación, Caja máster,
      cantidad 24`, y el de la 15 y la 16 `El GTIN aparece en el archivo con
      destinos distintos`. El resultado es **idéntico en una sesión nueva**.
- [ ] Los contadores suman el total; la tabla lista solo filas con incidencia.
- [ ] Cabe en 1280×720, 1366×768, 1440×900 y 1920×1080 sin necesidad de subirse
      con las 20 filas de ejemplo (la lista pagina a 25).
