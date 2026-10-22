# 09 · Verificación y escenarios de prueba

> **Objetivo:** demostrar —en un navegador real— que el módulo replicado se
> **comporta** como el original. Lee el código si hace falta, pero **cada punto de
> esta lista se comprueba ejecutándolo**, no leyéndolo.

## Cómo probar

- Navegador automatizado (Playwright/Chromium). Para pruebas que dependen de datos
  del catálogo (que en el demo es aleatorio), **toma los valores de la propia
  tabla** en vez de fijarlos, salvo la **fila ancla** y los códigos del catálogo de
  productos, que son estables.
- Los toasts duran 4 s: espera ~4.2 s entre acciones que muestren uno si la
  siguiente prueba lee el toast.
- Resoluciones obligatorias: **1280×720, 1366×768, 1440×900, 1920×1080**.
- Cada prueba reporta **qué falló**, no solo qué pasó. Nada de «se ve bien».

## A. Layout y apariencia (`03`)

1. En las 4 resoluciones: `scrollHeight` del documento ≤ alto de la ventana (sin
   scroll de página). Solo el contenedor de la tabla hace scroll.
2. Con scroll en la tabla, el encabezado y la fila de buscadores quedan pegados
   (comparar el borde superior contra la **parte interna** del contenedor, no su
   borde exterior: tiene 1 px).
3. Todo texto computa `12px` salvo menú lateral, `h1` (19 px), título de modal
   (14 px) y toasts (14 px).
4. Un valor largo continúa en otro renglón sin ensanchar la columna.
5. Con un ancho donde no caben filtros + botones + paginación en una línea, solo la
   paginación baja de renglón; nada desborda.
6. Los desplegables largos muestran ~5 opciones y hacen scroll.

## B. Tabla, filtros y paginación (`04`)

1. Al abrir: `Estatus=Activo`, `Filtrar` y borrador **disabled**, 0 inactivos
   visibles.
2. `Estatus` → `Todos`: `Filtrar` se habilita, el borrador **no**. Tras `Filtrar`,
   el borrador se habilita y aparecen inactivos.
3. Borrador: `Estatus` vuelve a **`Activo`**, ambos botones se apagan, **los
   buscadores de columna conservan su texto**.
4. Buscador con 2 caracteres + `Enter` → clase inválida, sin filtrar; con 3 →
   filtra sobre **todos** los registros (verifica que encuentra una fila que no
   está en la página visible).
5. Filtro `U. de M.`: cada fila visible tiene exactamente esa unidad.
6. Orden `Código` asc/desc **numérico**; la flecha resaltada corresponde a la
   columna ordenada (regresión de `dataIndex`).
7. Paginación a 25/50/75/100; ventana de 4 números con `...` y última; extremos
   deshabilitados en gris.
8. Interruptor: `Cancelar` no cambia el estatus ni anota; `Aceptar` sí.

## C. Formulario (`05`)

1. `Código` ignora letras; <3 dígitos sin menú; ≥3 → máx. 5 visibles + scroll;
   elegir llena nombre y `U. de M.`; `Esc` cierra solo el menú.
2. `Alcance=Producto` → `Empaque=Unidad` y `Cantidad=1` bloqueados (gris, sin flecha,
   no enfocables), **nunca** con `input--invalid`. Capturar `Presentación/Pallet/12`,
   cambiar a `Producto` y volver: se recupera `Pallet/12`.
3. `Cantidad`: `0`, vacío, `2.5`, `-3`, `abc` → inválidos; `7` válido.
4. `Guardar` disabled (verde claro) hasta que todo sea válido.
5. Declarar `GS1` + código con verificador malo → campo rojo; el tipo sigue `GS1`.
6. Preselección de tipo: teclear un GTIN sin tipo elegido lo preselecciona `GS1`;
   tras elegir tipo a mano, ya no cambia; al **editar**, nunca sugiere.
7. Alta válida: aparece **arriba**, resaltada ~4 s, página 1, toast verde. Alta cuyo
   `Estatus` activo queda fuera por un filtro (p. ej. filtro `Tipo` distinto): toast
   **ámbar** `…, aunque no se muestra con los filtros aplicados`.
8. Editar: `Guardar` disabled hasta cambiar algo; el estatus no es editable ahí.

## D. Reglas de negocio (`06`)

1. **12 vectores GS1** de `06`: cada uno da el resultado y el código indicados, con
   el mismo mensaje en formulario e importación.
2. Canónico: `7501234567893` → se guarda `07501234567893`.
3. **Unicidad manual** (con filas tomadas de la tabla viva):
   - mismo GTIN, destino distinto → `VAL-UNI-003`;
   - mismo proveedor + mismo código `No GS1`, destino distinto → `VAL-UNI-004`;
   - duplicado exacto → `VAL-UNI-002`.
   En los tres: toast rojo con `CÓDIGO · mensaje. corrección`, `Código proveedor` en
   rojo, **ventana abierta**, catálogo sin cambios.
4. Control: un alta legítima sí pasa.
5. **Edición sin tocar la identidad** (cambiar el código de producto) guarda sin
   `VAL-UNI-002` contra sí misma.
6. Dos `No GS1` con el mismo código y **proveedores distintos** → sin incidencia.

## E. Importación y Excel (`07`)

Para cada caso, genera el archivo y anota código y mensaje obtenidos:

| Caso | Esperado |
| --- | --- |
| Hoja renombrada | `VAL-EST-001`, sin tabla |
| Columna de más / de menos / reordenada / renombrada | `VAL-EST-002` con el detalle de qué falla |
| Solo encabezados | `VAL-EST-003` |
| 50 000 filas | acepta; 50 001 → `VAL-EST-007` **sin** revisar filas |
| Celda `=A1` (fórmula real) | `VAL-EST-006` |
| El texto `=A1` como **texto** | sin `VAL-EST-006` |
| Código proveedor de 51 caracteres | `VAL-EST-005` |
| Código proveedor de solo espacios | `VAL-EST-004` (no `-005`) |
| Alcance `Producto` con `Empaque`/`Cantidad` vacíos | se completan `Unidad`/`1` y la previsualización lo muestra |
| `Importar-correctos.xlsx` | `RES-VAL-001`, `Nuevas=5`, `Continuar` visible |
| `Importar-incompletos.xlsx` | `RES-VAL-002`, 18 filas con error, 2 nuevas, botón `Cerrar`; los 14 códigos de incidencia presentes |
| Plantilla descargada → importar | `VALIDADA`, 1 nueva |
| Exportación → importar | sin errores estructurales |

Además:

1. Los 4 contadores **suman** `Filas útiles`.
2. La tabla lista **solo** filas con incidencia.
3. El filtro `Tipo error` muestra «código · alias», ordenado por filas afectadas
   (desc), luego `ERROR` antes que `INFORMACION`, luego código. Filtrar y ordenar
   por `Fila`/`Detalle` funcionan y vuelven a la página 1.
4. **Unicidad contra el catálogo (fila ancla):** fila 19 de `Importar-incompletos`
   → `VAL-UNI-003` con `…código 1001293, Presentación, Caja máster, cantidad 24`.
   **Recargar la página y repetir:** resultado idéntico.
5. Una fila idéntica a un registro **activo** → `Sin cambio` (no error); idéntica a
   uno **inactivo** → `Con aviso` (`VAL-UNI-005`), no bloquea.
6. **`Continuar` con `Importar-correctos.xlsx` y `Estatus=Activo` (sin tocarlo):**
   toast **ámbar** `Se aplicó el archivo: 5 equivalencias nuevas, aunque la del
   código 1175731 no se muestra con los filtros aplicados`; los otros 4 códigos se
   ven. Cambiar a `Todos` → las 5 aparecen. Repetir con `Todos` desde el inicio →
   toast **verde** sin la cola.
7. Previsualización: cabe sin scroll de página en las 4 resoluciones con las 20
   filas del archivo de incompletos; **solo se «sube»** cuando no cabe.

## F. Bitácora (`08`)

1. Alta manual → `Alta · Registro completo · Manual`.
2. Editar 3 campos → 3 entradas; editar sin cambios → 0.
3. Interruptor tras `Aceptar` → `Baja`/`Reactivación`.
4. Carga masiva de 5 → 5 altas `Archivo`, mismo `CARGA-00N`, agrupadas visualmente
   (fondo + filo en la primera); alta manual posterior → `Manual`.
5. Filtros por `Fecha`, `Usuario`, `Código`, `Proveedor`, `Origen`: cada uno solo, y
   **combinados**; `Mostradas` coincide.
6. Paginación y `Registros por página` (25/50/75/100) como en la tabla; la ventana
   no cambia de alto.
7. `Origen=Archivo` + `Descargar` → `.xlsx` con exactamente esas filas, 10 columnas
   (`Operación` al final), `Usuario`/`Código` como texto; la ventana sigue abierta.
8. Cerrar y reabrir conserva filtros y tamaño de página.
9. **Estructura:** no hay ninguna escritura directa a un registro fuera de
   `commit*` (búsqueda en el código).

## G. Regresiones de fondo

- `U. de M.` **no** aparece en plantilla, exportación, previsualización, archivo
  de carga ni bitácora.
- Ningún código se convierte a número en ningún punto (probar con un GTIN con ceros
  a la izquierda: ida y vuelta por `.xlsx` conserva `07501234567893`).
- Vocabulario: ni «SKU» ni «Código externo» en ningún texto visible, encabezado de
  `.xlsx` o mensaje.
- Cero errores de JavaScript en consola durante todos los escenarios.
