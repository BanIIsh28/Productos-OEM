# Productos OEM

Recreación en HTML/CSS/JS del módulo **Productos OEM** del administrador de operaciones
de Apymsa, respetando la línea gráfica original (colores, tipografía, espaciados,
componentes e iconografía).

## Contenido

| Archivo | Descripción |
| --- | --- |
| `index.html` | Estructura del módulo: menú lateral, encabezado, acciones, filtros, tabla y pie. |
| `styles.css` | Estilos completos de la interfaz. |
| `app.js` | Datos de la vista y comportamiento (paginación, tabla, filtros, orden, exportación y selects). |
| `xlsx.js` | Generador de archivos `.xlsx` en el navegador, sin dependencias. |
| `assets/logo-apymsa.png` | Logotipo del encabezado del menú lateral. |

## Interacciones incluidas

- **Selects desplegables**: `Sucursal`, `Región` y `Registros por página` son
  desplegables funcionales con 3 opciones cada uno (datos de ejemplo). Se abren al
  hacer clic, marcan la opción seleccionada, y se cierran al elegir una opción,
  al hacer clic fuera o con `Esc`.
- **Botones con hover**: `Exportar` e `Importar` (azul), `Descargar plantilla`
  (verde) y los botones de paginación oscurecen ligeramente su color base al
  pasar el cursor, con un tono aún más oscuro al presionar.
- **Botones deshabilitados**: el gris `rgb(211, 211, 211)` está reservado para
  este estado (por ejemplo `Filtrar`), sin efecto hover.
- **Filtrado por columna**: cada campo `Buscar` del encabezado filtra únicamente
  su propia columna. El filtro se ejecuta al pulsar `Enter` y requiere un mínimo
  de 3 caracteres —salvo en `Sucursal ID`, donde basta 1—; con menos, el campo se
  marca en rojo y no filtra. Los filtros
  de varias columnas se combinan, la comparación ignora mayúsculas y acentos, y
  vaciar un campo retira su filtro. Si ninguna fila coincide se muestra un aviso.

- **Ordenamiento por columna**: las flechas del encabezado ordenan la tabla al
  hacer clic sobre él. `Sucursal ID` usa orden numérico; `Nombre sucursal` y
  `Región`, orden alfabético. Cada clic alterna ascendente y descendente, y la
  flecha del sentido activo se resalta. `Dirección` y `Centro asignado` no
  ordenan.

- **Exportar a Excel**: el botón `Exportar` descarga un archivo `.xlsx` real con
  los registros de la tabla, respetando los filtros y el orden aplicados. El
  encabezado se genera con el azul corporativo y los identificadores como valores
  numéricos. Un aviso confirma el nombre del archivo y cuántos registros incluye.

## Tipografía

Todos los textos usan 12 px, salvo el menú lateral (16 px, escalado según la
altura del viewport) y el título `Productos OEM` de la cabecera (19 px, negrita).

## Uso

Abrir `index.html` en el navegador. No requiere dependencias ni compilación.
