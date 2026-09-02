# Productos OEM

Recreación en HTML/CSS/JS del módulo **Productos OEM** del administrador de operaciones
de Apymsa, respetando la línea gráfica original (colores, tipografía, espaciados,
componentes e iconografía).

## Contenido

| Archivo | Descripción |
| --- | --- |
| `index.html` | Estructura del módulo: menú lateral, encabezado, acciones, filtros, tabla y pie. |
| `styles.css` | Estilos completos de la interfaz. |
| `app.js` | Datos de la vista y comportamiento (menú, paginación, tabla y selects). |
| `assets/logo-apymsa.png` | Logotipo del encabezado del menú lateral. |

## Interacciones incluidas

- **Selects desplegables**: `Sucursal`, `Región` y `Registros por página` son
  desplegables funcionales con 3 opciones cada uno (datos de ejemplo). Se abren al
  hacer clic, marcan la opción seleccionada, y se cierran al elegir una opción,
  al hacer clic fuera o con `Esc`.
- **Botones con hover**: `Exportar` e `Importar` (azul), `Descargar plantilla`
  (verde), `Filtrar` (gris) y los botones de paginación oscurecen ligeramente su
  color base al pasar el cursor, con un tono aún más oscuro al presionar.
- **Menú lateral**: resaltado sutil al pasar el cursor sobre cada opción.
- **Campos de búsqueda** en el encabezado de la tabla.

## Uso

Abrir `index.html` en el navegador. No requiere dependencias ni compilación.
