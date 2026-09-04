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
| `toast.js` | Mensajes toast del módulo (`showToast`). |
| `modal.js` | Ventanas modales del módulo (`openModal`). |
| `assets/logo-apymsa.png` | Logotipo del encabezado del menú lateral. |

## Columnas

| Columna | Contenido |
| --- | --- |
| SKU | código de 7 dígitos |
| Proveedor | nombre de distribuidor de autopartes |
| Tipo | `GS1` o `No GS1` |
| Código externo | código de 12 dígitos |
| Alcance | `Producto` o `Presentación` |
| Empaque | número de 1 a 20 |
| Cantidad | número de 1 a 20 |
| Estatus | interruptor circular que alterna activo (azul) e inactivo (gris) |
| Acciones | botón ámbar de esquinas redondeadas con icono de lápiz relleno y sugerencia `Editar` |

Los 182 registros de ejemplo se generan al cargar la vista, con valores aleatorios
dentro de esos rangos. `SKU`, `Proveedor`, `Código externo` y `Alcance` comparten
ancho; `Tipo`, las de un solo número y las de control son más angostas, y
cualquier valor más largo que su columna continúa en el siguiente renglón.

## Interacciones incluidas

- **Filtros superiores**: `Tipo`, `Alcance` y `Estatus` son desplegables con las
  mismas opciones que sus columnas, más `Todos` como valor inicial. La elección no
  se aplica hasta pulsar `Filtrar`, que permanece deshabilitado —en el gris de los
  controles sin acción— mientras no haya un cambio pendiente y toma su color
  `#0071B3` en cuanto lo hay. Los tres filtros se combinan entre sí y con los
  buscadores de columna.
- **Selects desplegables**: se abren al hacer clic, marcan la opción seleccionada,
  y se cierran al elegir una opción, al hacer clic fuera o con `Esc`.
- **Botones con hover**: `Exportar` e `Importar` (azul), `Descargar plantilla`
  (verde) y los botones de paginación oscurecen ligeramente su color base al
  pasar el cursor, con un tono aún más oscuro al presionar.
- **Botones deshabilitados**: el gris `rgb(211, 211, 211)` está reservado para
  este estado (por ejemplo `Filtrar`), sin efecto hover.
- **Filtrado por columna**: cada campo `Buscar` del encabezado filtra únicamente
  su propia columna —solo `SKU`, `Proveedor` y `Código externo` lo llevan—,
  buscando entre **todos** los registros y no solo entre los visibles en la página
  actual. El filtro se ejecuta al pulsar `Enter` y requiere un mínimo de 3
  caracteres; con menos, el campo se marca en rojo y no filtra. Los filtros
  de varias columnas se combinan, la comparación ignora mayúsculas y acentos, y
  vaciar un campo retira su filtro. Si ninguna fila coincide se muestra un aviso.

- **Paginación**: el número de páginas se calcula con los registros que dejan
  los filtros y el valor de `Registros por página` (25, 50, 75 o 100). Se muestran
  cuatro números a la vez en una ventana que sigue a la página actual; mientras
  queden páginas más allá de esa ventana aparecen los puntos y el número de la
  última página, que lleva directamente a ella. El botón de la página actual y
  las flechas `<` y `>` sin destino quedan deshabilitados. Filtrar u ordenar
  devuelve a la primera página.
- **Ordenamiento por columna**: las flechas del encabezado ordenan la tabla al
  hacer clic sobre él, solo en `SKU` (orden numérico) y `Proveedor` (orden
  alfabético). Cada clic alterna ascendente y descendente, y la flecha del
  sentido activo se resalta.

- **Exportar a Excel**: el botón `Exportar` descarga un archivo `.xlsx` real con
  los registros de la tabla, respetando los filtros y el orden aplicados. El
  encabezado se genera con el azul corporativo y los identificadores como valores
  numéricos. Un toast confirma el nombre del archivo y cuántos registros incluye.

- **Descargar plantilla**: el botón `Descargar plantilla` descarga
  `Plantilla-Productos-OEM.xlsx`, un archivo con los mismos encabezados y una
  fila de ejemplo, pensado para llenar y volver a cargar con `Importar`. Es
  siempre idéntico, sin importar los filtros activos.

## Mensajes toast

`showToast(mensaje, tipo)` muestra un aviso emergente. Hay tres variantes según
el resultado de la acción, todas con el color principal al 90% de opacidad:

| Tipo | Color | Uso |
| --- | --- | --- |
| `error` | `#D9534F` rojo | la acción falló |
| `success` | `#60BA7C` verde | la acción se completó |
| `warning` | `#DAA125` ámbar | la acción requiere atención |

Comparten contorno `#000000` de 2 px y texto `#FFFFFF` de 14 px. El ancho es
fijo (320 px): un mensaje largo crece solo a lo alto. Se sitúan a 50 px de los
bordes superior e izquierdo, y entran deslizándose horizontalmente desde fuera
del borde izquierdo —siempre a esa misma altura—, permanecen 4 segundos y
regresan por el mismo camino hasta salir de la vista.

## Desplazamiento

La vista no se desplaza: el título, la botonera, los filtros, la paginación, los
encabezados de columna con sus campos de búsqueda y el pie con `Registros por
página` permanecen fijos. Solo se desplazan las filas de la tabla, dentro de su
propio contenedor.

## Ventanas modales

`openModal({ title, body, buttons, onClose })` abre una ventana superpuesta a
toda la vista, sobre un fondo `#000000` al 50% de opacidad, centrada
horizontalmente y algo por encima del centro vertical.

La cabecera es azul con el título y una `X` de cierre; el cuerpo recibe el
contenido que se le pase y el pie coloca los botones a la derecha, con las
variantes `cancel` (rojo `#D9534F`) y `save` (verde `#60BA7C`), algo más bajos y
con esquinas redondeadas —la única excepción a los botones rectos del módulo—.
Se cierra con la `X`, con `Escape` o con cualquiera de sus botones; pulsar el
fondo no la cierra, para no perder lo capturado por descuido. Devolver `false`
desde el `onClick` de un botón la mantiene abierta.

El cuerpo de la ventana no recorta su contenido: los desplegables se superponen
al pie en lugar de provocar desplazamiento dentro del formulario. Si una ventana
llega a superar la altura de la pantalla, quien se desplaza es el fondo.

Los campos comparten la altura de los desplegables de los filtros (28 px) y el
texto va a 12 px, salvo el título de la cabecera, a 14 px. El estilo del campo de
solo lectura —el de `SKU`— queda reservado en `.field input[readonly]`, también
disponible como clase `.input--readonly` para reutilizarlo en otros formularios.

### Ventana de confirmación

`confirmModal({ title, message, accept, onAccept })` abre una ventana de solo
texto, con la misma línea y las mismas dimensiones que el formulario, para una
pregunta o un aviso. Lleva los botones `Cancelar` y `Aceptar`, y solo este último
ejecuta la acción.

El interruptor de la columna `Estatus` la usa: antes de aplicar el cambio pregunta
si de verdad se quiere activar o desactivar el estatus de esa equivalencia,
nombrando su SKU. Cancelar, cerrar con la `X` o pulsar `Escape` deja el estatus
como estaba.

### Formulario de equivalencia

La misma ventana sirve para dar de alta una equivalencia, desde
`Agregar equivalencia +`, y para editar una existente, desde el botón de lápiz de
la columna `Acciones`. Al editar llega con los datos del registro cargados, el
título cambia a `Editar equivalencia` y `Guardar` espera a que se modifique algún
dato; los cambios se aplican sobre el mismo registro, que queda resaltado unos
segundos. El estatus no se toca desde aquí: se cambia con el interruptor de la
tabla.

El formulario es:

| Fila | Campos |
| --- | --- |
| 1 | `SKU` (código, con búsqueda) y `Nombre del producto` (solo lectura) |
| 2 | `Proveedor` (con búsqueda) y `Código externo` |
| 3 | `Alcance`, `Empaque` y `Cantidad` |

`SKU` admite solo dígitos y, a partir de 3, despliega los productos del catálogo
cuyo código contiene lo escrito, mostrando el código seguido del nombre. Se ven
cinco a la vez y el resto se alcanza desplazando la lista; al elegir uno se
llenan el código y el nombre. `Proveedor` funciona igual sobre los nombres de
proveedores. `Alcance` arranca en `- Selecciona un alcance -`.

El catálogo se inventa al cargar la vista: 30 familias de refacción por 30
aplicaciones, 900 productos con código de 7 dígitos agrupados por familia. Los
registros de la tabla toman su SKU de ese catálogo, de modo que al editar uno se
pueda resolver el nombre de su producto.

`Guardar` permanece deshabilitado, en un verde más claro (`#95D195`), mientras el
formulario esté incompleto, y toma su color pleno al quedar todo capturado. Un
campo visitado que siga vacío o inválido se resalta en rojo también en reposo,
hasta que tenga un valor válido. El SKU y el proveedor deben corresponder a un
registro existente: no basta escribirlos, hay que elegirlos de la lista. Con todo capturado, la equivalencia se añade al
principio de la tabla: se retira el orden y se vuelve a la primera página para
dejarla a la vista, queda resaltada unos segundos y un toast lo confirma —o
advierte si los filtros activos la dejan fuera—. El `Tipo` se deduce del código
externo: se toma como `GS1` cuando su longitud es la de un GTIN (8, 12, 13 o 14
dígitos) y como `No GS1` en cualquier otro caso. Los registros nuevos entran
activos.

## Tipografía

Todos los textos usan 12 px, salvo el menú lateral (16 px, escalado según la
altura del viewport) y el título `Productos OEM` de la cabecera (19 px, negrita).

## Uso

Abrir `index.html` en el navegador. No requiere dependencias ni compilación.
