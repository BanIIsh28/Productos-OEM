# Productos OEM

Recreación en HTML/CSS/JS del módulo **Productos OEM** del administrador de operaciones
de Apymsa, respetando la línea gráfica original (colores, tipografía, espaciados,
componentes e iconografía).

## Contenido

| Archivo | Descripción |
| --- | --- |
| `index.html` | Estructura del módulo: menú lateral, encabezado, acciones, filtros, tabla y pie. |
| `styles.css` | Estilos completos de la interfaz. |
| `app.js` | Datos de la vista y comportamiento (paginación, tabla, filtros, orden, exportación, bitácora y selects). |
| `xlsx.js` | Generador de archivos `.xlsx` en el navegador, sin dependencias. |
| `xlsx-read.js` | Lector de archivos `.xlsx` en el navegador (`readXlsx`). |
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
- **Botones con hover**: `Exportar`, `Importar`, `Bitácora` y
  `Agregar equivalencia +` (azul), `Descargar plantilla`
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
horizontalmente y anclada por su borde superior, de modo que todas abran a la
misma altura sea cual sea su contenido.

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

### Ventana de importación

El botón `Importar` abre una ventana con el texto
`Seleccione el documento que desee cargar.`, un selector de archivo limitado a
`.xlsx` y el botón `Guardar`, que permanece deshabilitado en el verde claro hasta
que se elige un archivo.

Al pulsar `Guardar` se lee el archivo —`xlsx-read.js` interpreta el `.xlsx` en el
navegador— y se revisa registro por registro. Después se abre la
**previsualización**: una tabla ancha con todos los registros del archivo, los
correctos y los erróneos en un mismo listado, encabezada por una fila de campos
de solo lectura con el mismo aspecto que los del formulario de alta —`Archivo`,
`Registros`, `Correctos` y `Con errores`—.

La tabla de la previsualización crece con el contenido hasta ocupar el 40 % de la
altura de la ventana; a partir de ahí el excedente se desplaza dentro de la tabla,
con el encabezado azul fijo, y la ventana ya no crece más. Así un archivo de cinco
registros y otro de quinientos se presentan igual de bien.

Cada registro con algún problema se muestra sobre fondo rojizo, con el dato
concreto recuadrado y el detalle del error en la última columna; los correctos
llevan la palabra `Correcto`. Se comprueba que el SKU exista en el catálogo, que
el proveedor esté registrado, que el tipo sea `GS1` o `No GS1`, que el código
externo no esté vacío, que el alcance sea `Producto` o `Presentación`, que el
empaque y la cantidad sean números mayores que cero y que el estatus sea `Activo`
o `Inactivo`.

Si todo está correcto aparece el botón `Continuar`, que carga los registros al
principio de la tabla y lo confirma con un toast. Si falla un solo dato, ese botón
no se ofrece, el de cancelar pasa a llamarse `Cerrar` y a su izquierda, a la misma
altura, se muestra la leyenda de que hay que corregir el archivo y repetir el
proceso.

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

### Bitácora de cambios

El botón `Bitácora`, a la izquierda de `Agregar equivalencia +`, abre una ventana
extra ancha (hasta 1340 px) con el historial completo del catálogo.

**Ninguna acción ocurre sin dejar rastro.** Las tres funciones `commitAlta`,
`commitEdicion` y `commitEstatus` son las únicas del módulo que modifican los
registros, y cada una escribe su entrada en el mismo paso en que aplica el cambio.
El rastro no depende de que quien las llame se acuerde de anotarlo: pasan por
ellas el alta desde el formulario, el alta masiva de cada registro de un archivo
importado, la edición desde el lápiz y el cambio de estatus desde el interruptor.

Cada entrada guarda el **usuario** que hizo el cambio (un identificador de cinco
dígitos como máximo), el **campo modificado**, el **valor anterior**, el **valor
nuevo** y la **fecha y hora**. Según la acción:

| Acción | Campo | Valor anterior | Valor nuevo |
| --- | --- | --- | --- |
| `Alta` | `Registro completo` | — | los ocho datos del registro |
| `Edición` | el campo que cambió | su valor antes | su valor después |
| `Baja` | `Estatus` | `Activo` | `Inactivo` |
| `Reactivación` | `Estatus` | `Inactivo` | `Activo` |

Una edición que toca tres campos deja tres entradas, una por campo. La acción se
distingue por color: `Alta` en verde, `Edición` en ámbar, `Baja` en rojo y
`Reactivación` en el azul del módulo.

La vista se ordena de lo más reciente a lo más antiguo y se filtra por `Fecha y
hora`, `Usuario`, `SKU` y `Proveedor`, con los mismos campos `Buscar` del
encabezado que usa la tabla del catálogo: `Enter` para ejecutar, mínimo 3
caracteres, vaciar el campo retira su filtro y la comparación ignora mayúsculas y
acentos. **Los cuatro filtros se combinan entre sí**, de modo que un usuario y un
SKU dejan solo los cambios de esa persona sobre ese registro. La fecha se busca
sobre el texto `dd/mm/aaaa hh:mm`, así que `09/2026` acota un mes y `04/09` un día.
Los filtros se conservan al cerrar y reabrir la ventana, para retomar la consulta.

Encabezando la tabla, la misma fila de campos de solo lectura del resto de las
ventanas: `Usuario en sesión`, `Entradas` (el total) y `Mostradas` (las que
quedan tras los filtros). La tabla crece hasta el 42 % de la altura de la ventana
y a partir de ahí se desplaza internamente con el encabezado fijo.

El catálogo arranca con un historial previo verosímil —el alta de cada uno de los
182 registros más algunas ediciones y cambios de estatus repartidos en los últimos
meses, a nombre de distintos usuarios—, de modo que la vista tenga contenido desde
el principio. El valor nuevo de la última entrada de cada campo coincide siempre
con lo que la tabla muestra hoy.

## Tipografía

Todos los textos usan 12 px, salvo el menú lateral (16 px, escalado según la
altura del viewport) y el título `Productos OEM` de la cabecera (19 px, negrita).

## Uso

Abrir `index.html` en el navegador. No requiere dependencias ni compilación.
