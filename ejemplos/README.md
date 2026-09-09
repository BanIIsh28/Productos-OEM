# Archivos de ejemplo para la importación

Ambos siguen la estructura de la plantilla que descarga el módulo: `Código`,
`Proveedor`, `Tipo`, `Código externo`, `Alcance`, `Empaque`, `Cantidad` y
`Estatus`.

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

Cinco registros con un problema distinto cada uno, para probar la verificación:

| Fila | Problema |
| --- | --- |
| 2 | `Código` vacío |
| 3 | `Código` 9999999, que no existe en el catálogo |
| 4 | Proveedor que no está en la lista |
| 5 | `Tipo` `GS1` con dígito verificador inválido (`7501234567899`), `Empaque` en `Unidad` con alcance `Presentación` y `Cantidad` decimal (`2.5`) |
| 6 | `Tipo` `GS1` con la etiqueta completa en vez del GTIN (`(01)07501234567893`), `Alcance` ajeno (`Surtido`), `Cantidad` no numérica (`doce`) y `Estatus` desconocido (`Suspendido`) |
