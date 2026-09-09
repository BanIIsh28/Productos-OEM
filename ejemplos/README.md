# Archivos de ejemplo para la importación

Ambos traen la hoja `Carga_Equivalencias` con la estructura de la plantilla que
descarga el módulo: `Código`, `Proveedor`, `Tipo`, `Código externo`, `Alcance`,
`Empaque`, `Cantidad` y `Estatus`.

## `Importar-correctos.xlsx`

Cinco registros válidos, que además cubren los dos casos del destino
(RD-MOD-01): dos de alcance `Producto` —uno con `Unidad` y `1` escritos y otro
con esas dos celdas vacías, para ver cómo se completan solas— y tres de alcance
`Presentación`, con `Inner`, `Caja máster` y `Pallet`.

También cubren las dos clases de código: tres `GS1` con dígito verificador
correcto —uno de 13 dígitos, el mismo de 14 con su cero a la izquierda y uno de
12— y dos `No GS1` con código propietario. Los `GS1` se cargan en su forma
canónica de 14 posiciones.

Los códigos corresponden a productos del catálogo del módulo y los proveedores a
nombres de su lista:

| Código | Producto que resuelve |
| --- | --- |
| 1001000 | Balata delantera cerámica — Nissan Tsuru 1.6 |
| 1023711 | Filtro de aceite — Ford Ranger 2.5 |
| 1054701 | Bujía de iridio — Toyota Corolla 1.8 |
| 1175731 | Alternador — Honda Civic 1.8 |
| 1256613 | Maza de rueda — Mazda 3 2.0 |

## `Importar-incompletos.xlsx`

Diecinueve registros que recorren el catálogo de incidencias de la verificación:
diecisiete filas con error y dos que, a propósito, **no** generan ninguna. Todas
las incidencias son bloqueantes, así que el archivo entero se rechaza
(`RES-VAL-002 · VALIDACIÓN FALLIDA`) y no se ofrece `Continuar`.

Una incidencia clara por fila:

| Fila | Código | Qué trae |
| --- | --- | --- |
| 2 | `VAL-EST-004` | `Código` vacío |
| 3 | `VAL-MAE-001` | `Código` 9999999, que no existe en el catálogo |
| 4 | `VAL-MAE-002` | Proveedor que no está en la lista |
| 5 | `VAL-GS1-003` | GS1 con dígito verificador inválido |
| 6 | `VAL-GS1-002` | GS1 de 11 dígitos, longitud inválida |
| 7 | `VAL-GS1-004` | La etiqueta GS1-128 completa en lugar del GTIN |
| 8 | `VAL-GS1-005` | Un SSCC de 18 dígitos en lugar del GTIN |
| 9 | `VAL-EMP-001` | Alcance `Producto` con `Pallet` y cantidad 12 |
| 10 | `VAL-EMP-002` | Alcance `Presentación` con `Unidad` y cantidad 0 |
| 11 | `VAL-EST-005` | Código externo de 51 caracteres |
| 12 | `VAL-EST-006` | La celda del código externo es una fórmula (`=A1`) |

Las reglas de unicidad necesitan pares, así que van en filas consecutivas:

| Filas | Código | Qué trae |
| --- | --- | --- |
| 13 y 14 | `VAL-UNI-001` | La misma asociación repetida tal cual |
| 15 y 16 | `VAL-UNI-003` | El mismo GTIN con destinos distintos, entre proveedores distintos |
| 17 y 18 | `VAL-UNI-004` | El mismo código propietario del mismo proveedor con destinos distintos |

Las **filas 19 y 20** cierran el archivo con el caso CF-51775-29: dos registros
`No GS1` con el mismo código propietario, **proveedores distintos** y destinos
distintos. No son incidencia de ningún tipo, así que se cuentan como `Nuevas` y
no aparecen en la tabla —justo lo que hace la previsualización con las filas sin
incidencia—.
