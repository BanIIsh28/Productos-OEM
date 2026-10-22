# 04 · Tabla, filtros, buscadores, orden y paginación

> **Objetivo:** la vista principal y todo su comportamiento de consulta. Depende
> de `02` (registro y columnas) y `03` (apariencia).

## Tubería de datos de la tabla

`filteredRows()` = registros → **filtros superiores aplicados** → **buscadores de
columna** → **orden** → (la página se recorta después). Todo se evalúa sobre
**todos** los registros, no solo los visibles en la página.

## Filtros superiores (desplegables)

Cuatro, en este orden: **`U. de M.`** (`Todos|Metro|Pieza|Juego|No disponible`),
**`Tipo`** (`Todos|GS1|No GS1`), **`Alcance`** (`Todos|Producto|Presentación`),
**`Estatus`** (`Todos|Activo|Inactivo`).

- `U. de M.` filtra por un valor **que no está en la fila**: se calcula con
  `unidadDe(código)` al evaluar.
- **Dos estados por filtro: elegido (`pending`) y aplicado (`applied`).** Elegir en
  un desplegable no filtra; se aplica con **`Filtrar`**.
- **Valor inicial de cada filtro:** `Todos`, **excepto `Estatus`, que arranca en
  `Activo`** (el catálogo se consulta para operar y lo dado de baja estorba). El
  valor inicial se define en un solo lugar (`FILTROS_INICIALES = { estatus:
  'Activo' }`) y de ahí salen tanto el estado como el valor preseleccionado del
  desplegable y el comportamiento del borrador.
- **`Filtrar`**: deshabilitado (gris reservado, tooltip `Cambia algún filtro para
  poder aplicarlo`) mientras `pending` sea igual a `applied`; con cualquier
  diferencia pasa a su azul `#0071B3`. Al pulsarlo: `applied ← pending`, **vuelve a
  la página 1**, repinta paginación y filas.
- **Borrador** (a la derecha de `Filtrar`, solo icono): **habilitado únicamente
  si algún filtro *aplicado* difiere de su valor inicial** (no basta con haberlo
  elegido). Tooltips: deshabilitado `Aplica algún filtro para poder
  restablecerlo`; habilitado `Restablecer los filtros y la tabla`. Al pulsarlo:
  los desplegables, `pending` y `applied` vuelven a **su valor inicial**
  (`Estatus = Activo`, **no** `Todos`), página 1, repinta. **No toca los
  buscadores de columna ni el orden.** Con la vista en reposo (`Estatus=Activo`,
  resto `Todos`) está apagado.
- Los filtros se **combinan entre sí (Y)** y con los buscadores.

## Buscadores de columna

Campo `Buscar` en el encabezado de **`Código`**, **`Proveedor`** y **`Código
proveedor`**; cada uno filtra **solo su columna**.

- Se ejecuta al pulsar **`Enter`**.
- **Mínimo 3 caracteres.** Con menos, el campo se marca en rojo
  (`outline 2px rgb(200,70,70)`, fondo `rgb(253,240,240)`) y **no filtra**.
- Comparación: **contiene**, ignorando mayúsculas y acentos (`normalize`).
- **Vaciar el campo retira su filtro** (con `Enter` o simplemente al borrar el
  texto). El estado inválido se limpia al volver a escribir.
- Varios buscadores se combinan (Y). Tras ejecutar: página 1.
- Si ninguna fila coincide: aviso `No se encontraron registros con los filtros
  aplicados`.

## Ordenamiento

Solo **`Código`** (numérico, por valor) y **`Proveedor`** (alfabético sin acentos).
Cada clic en el encabezado **alterna** ascendente/descendente (empieza en
ascendente); la flecha del sentido activo se resalta. Ordenar vuelve a la página
1. Alta manual y carga masiva **retiran el orden** (para que lo nuevo quede al
principio) y apagan los indicadores.

> El indicador de orden se compara con `dataIndex` (guardado en el encabezado),
> **no** con la posición del encabezado en pantalla; si no, al existir una columna
> calculada se resaltaría la flecha equivocada. Ver `10`.

## Paginación

- Tamaño por página: **25 (por defecto), 50, 75, 100**, en el desplegable del pie.
- Número de páginas = `ceil(filas filtradas / tamaño)`, mínimo 1.
- **Ventana de 4 números** que siempre contiene la página actual:

```
PAGE_WINDOW = 4
inicio = min( max(actual - 1, 1),  max(ultima - PAGE_WINDOW + 1, 1) )
fin    = min( inicio + PAGE_WINDOW - 1, ultima )
mostrar: [<]  inicio…fin  [... y botón «ultima» si fin < ultima]  [>]
```

- `<` deshabilitado (gris reservado) en la página 1; `>` en la última. La página
  actual es gris y sin acción. `...` solo si quedan páginas después de la ventana;
  el número de la última lleva directamente a ella.
- Tooltips: `Página anterior`, `Página siguiente`, `Página actual`, `Página N`,
  `Ir a la última página`.
- Cambiar de tamaño, filtrar, buscar u ordenar → **página 1**.
- Este mismo componente (`paintPagination(host, actual, ultima, ir)`) se reutiliza
  en la previsualización y en la bitácora.

## Interruptor de `Estatus`

Pulsarlo **no cambia nada de inmediato**: abre una ventana de confirmación:

- Título `Activar estatus` / `Desactivar estatus` (según el estado al que pasaría).
- Mensaje `¿Deseas activar|desactivar el estatus de la equivalencia del código
  {código}?`
- `Cancelar`, `X` o `Esc` dejan el estatus como estaba. Solo `Aceptar` llama a
  `commitEstatus(row, nuevoEstado)` (que anota en la bitácora) y repinta el
  interruptor.

*Comportamiento observado del prototipo:* tras aceptar, el interruptor se repinta
en su sitio y la fila **no desaparece de inmediato** aunque el filtro `Estatus`
aplicado ya no la incluya; deja de verse en el siguiente repintado de la tabla
(filtrar, ordenar, paginar). Si el sistema destino prefiere sacarla al instante,
es una decisión de producto: no la tomes en silencio.

## Botón de lápiz

Abre el formulario de **edición** de esa fila (ver `05`).

## Recién agregado / editado

La fila agregada o editada recibe `row--new` (fondo `rgb(226,242,232)`) **4 s**,
mismo tiempo que su toast, y luego se repinta normal.

## Exportar

Ver `07`. Respeta los filtros (incluido el `Estatus` inicial: una exportación sin
tocar nada trae solo lo activo) y el orden vigentes.

## Criterios de aceptación

- [ ] Al abrir: `Estatus = Activo`; `Filtrar` y borrador **apagados**; no se ve
      ningún inactivo.
- [ ] Elegir `Todos` en Estatus enciende `Filtrar` pero **no** el borrador; tras
      `Filtrar` el borrador se enciende y aparecen inactivos.
- [ ] El borrador devuelve `Estatus` a `Activo` (no a `Todos`) y se apaga.
- [ ] El borrador no vacía los buscadores de columna ni cambia el orden.
- [ ] Un buscador con 2 caracteres + `Enter` se pone rojo y no filtra; con 3 filtra
      sobre **todos** los registros.
- [ ] `U. de M.` filtra correctamente aunque la columna sea calculada.
- [ ] Ordenar por `Código` ordena por valor (1000000 antes que 1000100) y la
      flecha resaltada corresponde a la columna ordenada.
- [ ] Con `Estatus = Todos` (183 filas) a 25 por página hay 8 páginas; en la 1 se
      ve `1 2 3 4 ... 8`; en la 8, `5 6 7 8`. (Con el `Activo` inicial salen
      menos filas, ~70 %, y por tanto menos páginas.)
- [ ] Cancelar la confirmación del interruptor no cambia el estatus ni la bitácora.
