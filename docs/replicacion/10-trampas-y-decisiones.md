# 10 · Trampas conocidas y decisiones que no deben revertirse

> Léelo **antes** de empezar. Son errores que ya ocurrieron en este módulo (con
> su causa), riesgos que se evitaron a propósito y decisiones tomadas
> deliberadamente. Revertirlas «porque parece más simple» reintroduce el problema.

## Trampas de implementación

| # | Síntoma | Causa | Qué hacer |
| --- | --- | --- | --- |
| 1 | Al insertar `U. de M.` en medio, datos desalineados o la flecha de orden resaltada en la columna equivocada | Se usaba la **posición de la columna** para leer la fila y para marcar el orden | `dataIndex` por columna (`null` para calculadas/controles); guardar `dataIndex` en el encabezado y comparar contra él |
| 2 | Un valor `'0'` desaparece del campo | `if (opts.value)` es falsy para `'0'` | `if (opts.value != null)` |
| 3 | Un `classList.toggle(clase, valor)` alterna en vez de fijar | Se pasaba `undefined` como 2.º argumento | Pasar siempre un booleano (`!!valor`) |
| 4 | El botón de borrador no tenía tamaño (icono de 0 px) | `.btn:disabled` (especificidad 0,2,0) ganaba a `.btn--icon` (0,1,0) y el botón **nace deshabilitado** | Declarar `.btn--icon, .btn--icon:disabled` **después** del bloque de deshabilitado |
| 5 | Hueco visual junto al selector de «Tipo error» | `flex: 1 1 auto` hacía crecer el campo más allá del select con ancho tope | `flex: 0 1 auto` y `width: 430px; max-width: 100%` en el select |
| 6 | Al añadir el 4.º filtro la fila desbordaba | No cabía a <1440 px | Medir la opción más larga (`No disponible` ≈ 73 px), ancho 124/116 px y `flex-wrap: wrap` (baja solo la paginación) |
| 7 | «El encabezado no queda pegado» (falso negativo) | La medición comparaba contra el borde exterior del contenedor, ignorando su borde de 1 px | Comparar contra la parte interna (`clientTop`) |
| 8 | `.xlsx` corrupto | La longitud del directorio central incluía los bytes del EOCD | Capturar la longitud **antes** de escribir el EOCD |
| 9 | Un `=algo` de texto se importó como fórmula en las pruebas | `openpyxl` escribe como fórmula real cualquier cadena que empiece por `=` | Para probar el texto literal, parchear el XML de la hoja con `t="inlineStr"` |
| 10 | GTIN pierde ceros / notación científica | Se emitió o leyó como número | Celdas de texto (en `openpyxl`: `data_type='s'` y `number_format='@'`); leer el valor literal |
| 11 | *(riesgo evitado)* Rechazar códigos propietarios legítimos que empiezan con `=`, `+`, `-` o `@` | Detectar fórmula por el primer carácter | Detectar fórmula **solo** por `<f>` en el XML |
| 12 | *(riesgo evitado)* `Código proveedor` de solo espacios clasificado como problema de longitud (`VAL-EST-005`) en vez de campo vacío | Medir la longitud antes de recortar | Recortar primero; vacío → `-004`; largo (ya recortado) → `-005` |
| 13 | Toast ámbar ausente tras importar filas inactivas | El mensaje no consideraba el filtro `Estatus=Activo` por defecto | Guardar referencias de las filas insertadas y comprobar `filteredRows()` tras repintar |
| 14 | Fechas simuladas en el futuro | Un cambio posterior = alta + N días con un alta reciente | Topar con «ahora» |
| 15 | Con 20 filas de ejemplo el README decía que la previsualización «se sube» | Texto desactualizado tras añadir la fila 19 | Medir (cabe sin subirse) y corregir el texto |

## Trampas de prueba (no son bugs del producto)

- `Escape` dentro de un modal **cierra todo el modal**, salvo con un menú de
  sugerencias abierto (ahí solo cierra el menú).
- Al perder el foco, `Guardar` puede volver a deshabilitarse **antes** de que el clic
  automatizado llegue.
- No se puede `fill()` un campo de solo lectura (p. ej. `Cantidad` en un registro
  `Producto`): elige un registro `Presentación` o cambia otro campo.
- Un prefijo de proveedor (`Autopart…`) casa con varios en el autocompletado: usa
  el **nombre completo** y compara con coincidencia exacta.
- El catálogo de registros es aleatorio en cada sesión: toma los datos de la tabla
  viva; solo la **fila ancla** y los códigos de producto son estables.
- Un archivo de ejemplo **se regenera y se vuelve a correr** cada vez que cambia una
  regla de importación; no se da por bueno sin ejecutarlo.

## Decisiones que no deben revertirse

1. **`Tipo` explícito**; nunca inferido para guardar (ver `01`). La preselección es
   una ayuda que se apaga sola.
2. **Una sola función por regla** (`validarCodigoExterno`, `conflictosDeUnicidad`,
   `codigoCanonico`, `claveAsociacion`, `commit*`).
3. **`VAL-UNI-003` no mira proveedor; `VAL-UNI-004` sí** (y la excepción
   CF-51775-29 es intencional).
4. **`VAL-UNI-002` solo en alta/edición manual.** En carga masiva una asociación
   idéntica es `sin cambio`/`con aviso`, **no error**.
5. **Un solo error rechaza el archivo completo**; un aviso no.
6. **`Estatus` arranca en `Activo`** y el borrador devuelve ahí, no a `Todos`.
7. **`U. de M.` no se guarda, ni exporta, ni anota.**
8. **El rastro es estructural**, no una convención (ver `08`).
9. **El fondo de una ventana no la cierra.** Un `onClick` que devuelve `false` la
   mantiene abierta.
10. **La previsualización solo se «sube» cuando no cabe**; las demás ventanas abren
    todas a la misma altura.
11. **La previsualización no lleva tabla de desglose por código** (se quitó a
    propósito): el filtro `Tipo error`, con código + alias, hace ese trabajo.
12. **Códigos de incidencia de la historia**, nunca inventados (`VAL-CAM-*` no
    existe).
13. **El código de producto no forma parte de la clave de asociación.**
14. **Se comprueba la longitud del GTIN antes que el dígito verificador.**
15. **No cierres por tu cuenta lo que está pendiente** (`VAL-UNI-006`,
    `VAL-PRV-*`, `VAL-MAE-003`, `RD-MOD-02`, normalización `No GS1`): déjalo
    declarado y señalado.

## Cuando dudes

Si la especificación y el código del prototipo difieren, **gana el código** y avisas.
Si dos partes de la especificación se contradicen, no escojas en silencio: señálalo
en una o dos frases y propón una resolución. Si algo no está dicho, la opción más
conservadora, anotada como **SUPUESTO**.
