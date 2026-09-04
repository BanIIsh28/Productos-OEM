# Archivos de ejemplo para la importación

Ambos siguen la estructura de la plantilla que descarga el módulo: `SKU`,
`Proveedor`, `Tipo`, `Código externo`, `Alcance`, `Empaque`, `Cantidad` y
`Estatus`.

## `Importar-correctos.xlsx`

Cinco registros válidos. Los SKU corresponden a productos del catálogo del
módulo y los proveedores a nombres de su lista:

| SKU | Producto que resuelve |
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
| 2 | `SKU` vacío |
| 3 | `SKU` 9999999, que no existe en el catálogo |
| 4 | Proveedor que no está en la lista |
| 5 | `Código externo` vacío |
| 6 | `Alcance` con un valor ajeno (`Surtido`), `Empaque` vacío, `Cantidad` no numérica (`doce`) y `Estatus` desconocido (`Suspendido`) |
