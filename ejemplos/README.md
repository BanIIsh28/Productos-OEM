# Archivos de ejemplo para la importación

Ambos traen la hoja `Carga_Equivalencias` con la estructura de la plantilla que
descarga el módulo: `Código`, `Proveedor`, `Tipo`, `Código proveedor`, `Alcance`,
`Empaque`, `Cantidad` y `Estatus`.

## `Importar-correctos.xlsx`

Cinco registros válidos y **todos activos**: la previsualización sale
`RES-VAL-001 · VALIDADA` sin incidencias y, al pulsar `Continuar`, el aviso final es
verde —`Se aplicó el archivo: 5 equivalencias nuevas`— y las cinco filas se ven en la
tabla con los filtros iniciales.

| Fila | Código | Proveedor | Tipo | Código proveedor | Alcance | Empaque | Cantidad |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 1001000 | Robert Bosch México | GS1 | 7501234567893 | Producto | Unidad | 1 |
| 3 | 1001000 | Mann-Filter México | GS1 | 07501234567893 | Producto | *(vacío)* | *(vacío)* |
| 4 | 1054701 | NGK Bujías | No GS1 | NGK-IR-4544 | Presentación | Inner | 8 |
| 5 | 1175731 | Denso Refacciones | GS1 | 036000291452 | Presentación | Caja máster | 24 |
| 6 | 1256613 | Timken Rodamientos | No GS1 | TMK-HA590210 | Presentación | Pallet | 144 |

Qué cubre:

- **Los dos destinos (RD-MOD-01):** dos de alcance `Producto` —uno con `Unidad` y `1`
  escritos y otro con esas dos celdas vacías, que se completan solas— y tres de
  alcance `Presentación`, con `Inner`, `Caja máster` y `Pallet`.
- **Las dos clases de código:** tres `GS1` con dígito verificador correcto —uno de 13
  dígitos, el mismo con su cero a la izquierda (14) y uno de 12— y dos `No GS1`. Los
  `GS1` se guardan en su forma canónica de 14 posiciones.
- **Un mismo GTIN con dos proveedores:** las filas 2 y 3 son **el mismo producto**
  con el mismo GTIN y el mismo destino, de dos proveedores. No chocan: la identidad
  de una asociación incluye al proveedor. Es el mismo producto a propósito, para que
  el archivo siga siendo válido aunque se decida que el destino incluya el código de
  producto.

Los códigos corresponden a productos del catálogo del módulo y los proveedores a
nombres de su lista:

| Código | Producto que resuelve |
| --- | --- |
| 1001000 | Balata delantera cerámica — Nissan Tsuru 1.6 |
| 1054701 | Bujía de iridio — Toyota Corolla 1.8 |
| 1175731 | Alternador — Honda Civic 1.8 |
| 1256613 | Maza de rueda — Mazda 3 2.0 |

*Para ver el aviso de «fila cargada pero fuera de la vista»:* cambia a `Inactivo` el
`Estatus` de cualquier fila antes de importar. La tabla arranca filtrada por
`Activo`, así que esa fila se carga sin verse y el aviso final sale ámbar.

## `Importar-incompletos.xlsx`

Dieciocho registros con **un caso de cada incidencia bloqueante** que puede salir de
un archivo: catorce códigos distintos en dieciséis filas con error, más dos filas que,
a propósito, **no** generan ninguna. Todas las incidencias son bloqueantes, así que el
archivo entero se rechaza (`RES-VAL-002 · VALIDACIÓN FALLIDA`) y no se ofrece
`Continuar`.

Cada fila falla por **una sola** cosa:

| Fila | Código | Qué trae |
| --- | --- | --- |
| 2 | `VAL-EST-004` | `Código` vacío |
| 3 | `VAL-MAE-001` | `Código` 9999999, que no existe en el catálogo |
| 4 | `VAL-MAE-002` | Proveedor que no está en la lista |
| 5 | `VAL-GS1-003` | GS1 con dígito verificador inválido |
| 6 | `VAL-GS1-002` | GS1 de 11 dígitos, longitud inválida |
| 7 | `VAL-GS1-004` | La etiqueta GS1-128 completa en lugar del GTIN |
| 8 | `VAL-GS1-005` | Un SSCC de 18 dígitos en lugar del GTIN |
| 9 | `VAL-EMP-001` | Alcance `Producto` con empaque `Pallet` (la cantidad es `1`, correcta) |
| 10 | `VAL-EMP-002` | Alcance `Presentación` con empaque `Unidad` (la cantidad es `5`, correcta) |
| 11 | `VAL-EST-005` | Código proveedor de 51 caracteres |
| 12 | `VAL-EST-006` | La celda del código proveedor es una **fórmula real** (`=A1`) |

Las reglas de unicidad entre filas del archivo necesitan pares, así que van en filas
consecutivas; cada par es **un** caso:

| Filas | Código | Qué trae |
| --- | --- | --- |
| 13 y 14 | `VAL-UNI-001` | La misma asociación repetida tal cual |
| 15 y 16 | `VAL-UNI-004` | El mismo código propietario del mismo proveedor con destinos distintos |

La **fila 17** es el caso de unicidad contra el catálogo, y por eso va sola:

| Fila | Código | Qué trae |
| --- | --- | --- |
| 17 | `VAL-UNI-003` | El GTIN `07500001234563` con alcance `Producto`, mientras el catálogo ya lo tiene en `Presentación · Caja máster · 24` |

Choca contra un registro que ya existe en el catálogo desde el arranque —la fila
ancla del módulo, código `1001293` de `Robert Bosch México`, fija en cualquier sesión
justamente para que este ejemplo sea reproducible—, no contra otra fila del archivo.
El proveedor tampoco importa: la fila trae otro y la incidencia se levanta igual,
porque un GTIN no puede apuntar a dos destinos sea de quien sea.

Las **filas 18 y 19** cierran el archivo con el caso CF-51775-29: dos registros
`No GS1` con el mismo código propietario, **proveedores distintos** y destinos
distintos. No son incidencia de ningún tipo, así que se cuentan como `Nuevas` y no
aparecen en la tabla.

### Lo que un archivo no puede mostrar

Quedan fuera de estos ejemplos, y no por olvido:

- **Rechazos de estructura** (`VAL-EST-001`, `-002`, `-003` y `-007`): tumban el
  archivo entero antes de mirar fila por fila, así que no pueden convivir con
  incidencias de fila. Cada uno necesita su propio archivo: otra hoja, columnas
  distintas, sin filas útiles o más de 50 000.
- **`VAL-UNI-002`** (asociación idéntica a una del catálogo): solo la levanta el
  formulario. En la carga masiva esa fila es `sin cambio`, no un error.
- **`VAL-UNI-005`** (asociación que ya existe, inactiva) es un aviso informativo, no
  un error, y el catálogo de arranque no trae un registro inactivo conocido con el
  que chocar.
- **`VAL-UNI-006` y `VAL-GS1-001`** están declarados pero hoy no los dispara nada.
