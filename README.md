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
| `xlsx-read.js` | Lector de archivos `.xlsx` en el navegador (`readXlsx`): localiza la hoja por su nombre visible y marca las celdas con fórmula. |
| `toast.js` | Mensajes toast del módulo (`showToast`). |
| `modal.js` | Ventanas modales del módulo (`openModal`). |
| `assets/logo-apymsa.png` | Logotipo del encabezado del menú lateral. |

## Columnas

| Columna | Contenido |
| --- | --- |
| Código | código de producto, de 7 dígitos |
| Proveedor | nombre de distribuidor de autopartes |
| Tipo | `GS1` o `No GS1` |
| Código externo | GTIN canónico de 14 dígitos si el tipo es `GS1`; código propietario si es `No GS1` |
| Alcance | `Producto` o `Presentación` |
| Empaque | nivel de empaque: `Unidad`, `Inner`, `Caja máster` o `Pallet` |
| Cantidad | entero mayor o igual que 1 |
| Estatus | interruptor circular que alterna activo (azul) e inactivo (gris) |
| Acciones | botón ámbar de esquinas redondeadas con icono de lápiz relleno y sugerencia `Editar` |

Los 182 registros de ejemplo se generan al cargar la vista, con valores aleatorios
dentro de esos rangos, con el destino ya conforme a la regla RD-MOD-01 —los de
alcance `Producto` llevan `Unidad` y `1`, y los de `Presentación`, un nivel
agrupado y su cantidad— y con el código externo coherente con su tipo: los `GS1`
llevan un GTIN-14 con dígito verificador correcto y los `No GS1`, un código
propietario alfanumérico. `Código`, `Proveedor`, `Código externo` y `Alcance` comparten
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
  su propia columna —solo `Código`, `Proveedor` y `Código externo` lo llevan—,
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
  hacer clic sobre él, solo en `Código` (orden numérico) y `Proveedor` (orden
  alfabético). Cada clic alterna ascendente y descendente, y la flecha del
  sentido activo se resalta.

- **Exportar a Excel**: el botón `Exportar` descarga un archivo `.xlsx` real con
  los registros de la tabla, respetando los filtros y el orden aplicados. El
  encabezado se genera con el azul corporativo y los identificadores como valores
  numéricos. Un toast confirma el nombre del archivo y cuántos registros incluye.

- **Descargar plantilla**: el botón `Descargar plantilla` descarga
  `Plantilla-Productos-OEM.xlsx`, un archivo con los mismos encabezados y una
  fila de ejemplo, pensado para llenar y volver a cargar con `Importar`. Es
  siempre idéntico, sin importar los filtros activos. La fila de ejemplo pasa la
  propia verificación del módulo —código del catálogo, proveedor registrado, GTIN
  con dígito verificador correcto y destino conforme—, así que descargarla e
  importarla tal cual da un registro correcto sin retocar nada.

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
solo lectura —el de `Código`— queda reservado en `.field input[readonly]`, también
disponible como clase `.input--readonly` para reutilizarlo en otros formularios.

### Ventana de confirmación

`confirmModal({ title, message, accept, onAccept })` abre una ventana de solo
texto, con la misma línea y las mismas dimensiones que el formulario, para una
pregunta o un aviso. Lleva los botones `Cancelar` y `Aceptar`, y solo este último
ejecuta la acción.

El interruptor de la columna `Estatus` la usa: antes de aplicar el cambio pregunta
si de verdad se quiere activar o desactivar el estatus de esa equivalencia,
nombrando su código. Cancelar, cerrar con la `X` o pulsar `Escape` deja el estatus
como estaba.

### Ventana de importación

El botón `Importar` abre una ventana con el texto
`Seleccione el documento que desee cargar.`, un selector de archivo limitado a
`.xlsx` y el botón `Guardar`, que permanece deshabilitado en el verde claro hasta
que se elige un archivo.

Al pulsar `Guardar` se lee el archivo —`xlsx-read.js` interpreta el `.xlsx` en el
navegador— y se revisa registro por registro. Después se abre la
**previsualización**.

#### Validaciones estructurales del archivo (VAL-EST-001 a 007)

Se comprueban **antes** de mirar fila por fila. Las cinco primeras rechazan el
archivo entero y la ventana termina en el mensaje, sin tabla que listar:

| Código | Regla |
| --- | --- |
| `VAL-EST-001` | La hoja debe llamarse exactamente `Carga_Equivalencias`. Si no está o la renombraron, se rechaza sin adivinar otra hoja |
| `VAL-EST-002` | Las columnas deben ser las de la plantilla: las mismas, con el mismo texto y en el mismo orden, sin faltantes, repetidas, renombradas, reordenadas ni de más |
| `VAL-EST-003` | El archivo no tiene ninguna fila útil bajo los encabezados |
| `VAL-EST-007` | Más de 50,000 filas útiles. Se revisa **primero**, para no gastar tiempo validando filas que se van a rechazar de todas formas |
| `VAL-EST-004` | Campo obligatorio vacío. Un código externo de solo espacios queda vacío al recortarlo, y cuenta como campo sin capturar, no como problema de longitud |
| `VAL-EST-005` | Valor que no cumple el tipo, el formato o el largo máximo de 50 caracteres del código externo. La longitud se mide **ya recortada**, para que un espacio de más no provoque un rechazo que el valor real no merece |
| `VAL-EST-006` | La celda del código externo es una **fórmula** |

`VAL-EST-006` mira lo que el XML guarda, no lo que el valor parece: Excel escribe
un elemento `<f>` en las celdas calculadas. Un texto literal que empiece por `=`,
`+`, `-` o `@` no lleva `<f>` y **no** se rechaza, porque un código propietario
puede legítimamente empezar así.

Para poder aplicar estas dos reglas hubo que rehacer el lector `xlsx-read.js`:
antes tomaba la primera hoja física del ZIP sin mirar su nombre, y no distinguía
una fórmula de un valor literal. Ahora resuelve el nombre visible de cada hoja
—leyendo `xl/workbook.xml` y `xl/_rels/workbook.xml.rels` y cruzando el `r:id`
con el `Target`— y devuelve, junto a las filas, un arreglo paralelo que dice qué
celdas son fórmulas. `readXlsx(file, nombreHoja)` entrega
`{ encontrada, hojas, filas, formulas }`.

Los archivos que genera el módulo —plantilla, exportación y los dos de
`ejemplos/`— usan la hoja `Carga_Equivalencias`, de modo que descargar y volver a
cargar funcione sin retocar nada.

#### Clasificación de las filas (ERB-51775)

Cada fila útil del archivo recibe **exactamente una** clase:

| Clase | Código | Qué significa | ¿Incidencia? |
| --- | --- | --- | --- |
| Nueva | `RES-FIL-002` | Válida y no existe en el catálogo | No |
| Sin cambio | `RES-FIL-001` | La asociación exacta ya existe y está activa | No |
| Con aviso | `RES-FIL-003` | Ya existe pero está **inactiva** | Sí, informativa |
| Con error | — | Incumple alguna regla | Sí, bloqueante |

La identidad de una asociación se compara por **proveedor + tipo + código externo
normalizado + destino** (alcance, empaque y cantidad). *Nota de alcance*: es la
comparación simple; la clave canónica distinta por clase de RD-MOD-02, que agrupa
varias filas GS1 en una sola equivalencia, es una pieza aparte que todavía no
está aquí.

Un aviso **no bloquea**: la asociación inactiva se reactiva desde la pantalla de
baja y reactivación, no desde la carga masiva, así que el archivo sigue siendo
válido. Un solo error, en cambio, rechaza el archivo completo.

#### Reglas de unicidad dentro del archivo

Se aplican viendo el archivo completo, no fila por fila, y solo sobre las filas
que pasaron su revisión individual —una fila con el tipo o el destino mal ya está
rechazada, y compararla contra las demás daría incidencias sin sentido—:

| Código | Regla |
| --- | --- |
| `VAL-UNI-001` | Dos filas con proveedor, tipo, código normalizado y destino idénticos |
| `VAL-UNI-003` | Dos filas `GS1` con el mismo GTIN y destino distinto, **sea cual sea el proveedor** |
| `VAL-UNI-004` | Dos filas `No GS1` del **mismo proveedor** con el mismo código y destino distinto |

Las tres rechazan el archivo completo. Dos filas `No GS1` con el mismo código
pero **proveedores distintos** no generan incidencia de ningún tipo, aunque sus
destinos difieran: es intencional (CF-51775-29).

#### Los tres estados de la previsualización

| Situación | Estado | Mensaje | ¿Continuar? |
| --- | --- | --- | --- |
| Todo nueva o sin cambio | `RES-VAL-001 · VALIDADA` | No se detectaron incidencias | Sí |
| Hay avisos, cero errores | `RES-VAL-001 · VALIDADA` | Se detectaron N incidencias, ninguna bloqueante | Sí |
| Al menos un error | `RES-VAL-002 · VALIDACIÓN FALLIDA` | N filas tienen una incidencia bloqueante | No |

Lo que habilita `Continuar` es la ausencia de **errores**, no la ausencia de
incidencias: un archivo con avisos se puede aplicar.

#### Qué se ve

El encabezado siempre muestra, en un solo renglón de ocho campos, `Archivo`,
`Fecha`, `Usuario` —un identificador simulado, el mismo que estampa la bitácora,
porque el prototipo no tiene autenticación—, `Filas útiles` y el desglose en
cuatro contadores: `Nuevas`, `Sin cambio`, `Con aviso` y `Con error`, cuya suma
es siempre el total.

Debajo, un **desglose por código** de incidencia con cinco columnas: código,
alias corto, severidad (`ERROR` o `INFORMACION`), filas afectadas y porcentaje
sobre el total de incidencias con un decimal. Se ordena por número de filas
descendente; a igualdad, `ERROR` antes que `INFORMACION`, y luego por código
alfabéticamente. **Pulsar un renglón deja en la tabla solo las filas de ese
código**, y volver a pulsarlo retira el filtro. Al redondear a un decimal la suma
de los porcentajes puede quedar en 99.9 % o 100.1 %.

Sobre la tabla, una fila de **filtros combinables** —`Código`, `Columna afectada`
y `Severidad`, cada uno con `Todos` por omisión y armado con los valores que de
verdad aparecen en el archivo— y la **paginación**, con el mismo componente que la
tabla del catálogo y la bitácora. El desplegable `Código` y el desglose están
sincronizados: pulsar un renglón del desglose mueve también el filtro. En el pie,
`Incidencias por página` con 25, 50, 75 y 100.

Los encabezados `Fila` y `Detalle` **ordenan** la lista, con las mismas flechas de
ascendente y descendente del catálogo: por número de fila del archivo y por código
de incidencia. Filtrar o cambiar el orden vuelve a la primera página, y el
encabezado de la ventana conserva siempre el **total real** de filas, no el de la
página visible.

Por último, la tabla de incidencias: **solo lista las filas con aviso o con
error**. Las que no tienen incidencia únicamente se cuentan en el encabezado,
para no obligar a buscar el problema entre cientos de filas correctas; cuando no
hay ninguna, la tabla lo dice explícitamente. Cada fila muestra el dato concreto
recuadrado —con el código y el mensaje en su ayuda— y, en la última columna, el
código y el mensaje de cada incidencia, con la corrección recomendada en la
ayuda. Las filas con error van sobre fondo rojizo; las que solo traen aviso,
ámbar.

La tabla crece con el contenido hasta ocupar el 30 % de la altura de la ventana;
a partir de ahí el excedente se desplaza dentro de la tabla, con el encabezado
azul fijo, y la ventana ya no crece más.

Como esta ventana apila más bloques que ninguna otra, está ajustada para caber
entera sin que la página se desplace: arranca más arriba que el resto
—`clamp(16px, 4vh, 40px)` en lugar de `clamp(60px, 16vh, 220px)`—, el encabezado
va en un renglón en vez de dos y la fila de filtros lleva la etiqueta al lado del
desplegable, no encima. Con el archivo de ejemplo más cargado —19 filas, 17 con
incidencia— cabe completa en 1280×720, 1366×768, 1440×900 y 1920×1080.

*Nota*: el catálogo de códigos —alias, severidad y corrección recomendada— va en
línea en `app.js` con valores razonables, pendiente de venir de una fuente
externa. Los códigos `VAL-MAE-001/002`, `VAL-UNI-001/003/004/005`,
`VAL-GS1-001/002/003/004/005` y `VAL-EMP-001/002` son los de la historia.
Quedan pendientes por falta de dato en el catálogo simulado: `VAL-PRV-001/002`
(matriz proveedor-identificador OEM/no-OEM) y `VAL-MAE-003` (nivel de empaque
inexistente o inactivo). Queda fuera de este alcance la clave canónica
distinta por clase de RD-MOD-02.

#### Qué se revisa en cada fila

Se comprueba que el código exista en el catálogo, que el proveedor esté
registrado, que el tipo sea `GS1` o `No GS1`, que el código externo cumpla la
norma de su tipo declarado —longitud y dígito verificador si es `GS1`, solo no
estar vacío si es `No GS1`—, que el alcance sea `Producto` o `Presentación`, que
el estatus sea `Activo` o `Inactivo`, y que el destino cumpla la regla: con
alcance `Producto` el empaque ha de ser `Unidad` y la cantidad `1` —si el archivo
trae esas dos celdas vacías se completan solas, y la previsualización muestra ya
el valor completado—, y con alcance `Presentación` el empaque ha de ser `Inner`,
`Caja máster` o `Pallet` y la cantidad un entero mayor o igual que 1.

`Continuar` carga al principio de la tabla **solo las filas nuevas**: las que no
cambian nada y las que traen aviso no tocan el catálogo ni dejan entrada en la
bitácora. El toast distingue los dos desenlaces —`Se aplicó el archivo: N
equivalencias nuevas` o `El archivo se aplicó sin cambios: ninguna fila era
nueva`— y entre paréntesis dice cuántas se omitieron y por qué. Si hay algún
error, ese botón no se ofrece y el de cancelar pasa a llamarse `Cerrar`.

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
| 1 | `Código` (con búsqueda) y `Nombre del producto` (solo lectura) |
| 2 | `Proveedor` (con búsqueda) |
| 3 | `Tipo` y `Código externo` |
| 4 | `Alcance`, `Empaque` y `Cantidad` — el destino |

`Código` admite solo dígitos y, a partir de 3, despliega los productos del catálogo
cuyo código contiene lo escrito, mostrando el código seguido del nombre. Se ven
cinco a la vez y el resto se alcanza desplazando la lista; al elegir uno se
llenan el código y el nombre. `Proveedor` funciona igual sobre los nombres de
proveedores. `Alcance` arranca en `- Selecciona un alcance -`.

#### El destino (RD-MOD-01)

El destino de una equivalencia es **código + alcance + nivel de empaque + cantidad**,
y los dos últimos dependen del alcance:

| Alcance | Nivel de empaque | Cantidad |
| --- | --- | --- |
| `Producto` | fijo en `Unidad`, no se captura | fija en `1`, no se captura |
| `Presentación` | obligatorio: `Inner`, `Caja máster` o `Pallet` | obligatoria: entero ≥ 1 |

En la carga masiva, incumplir la regla se reporta con `VAL-EMP-001` cuando el
alcance es `Producto` y el nivel o la cantidad no son `Unidad` y `1`, y con
`VAL-EMP-002` cuando el alcance es `Presentación` y el nivel o la cantidad no
sirven. Que falte el dato sigue siendo `VAL-EST-004`, campo vacío.

`Empaque` es un desplegable que arranca en `- Selecciona un empaque -` y solo
ofrece los tres niveles agrupados; `Unidad` no está entre sus opciones porque
nunca se elige a mano. Con alcance `Producto`, los dos campos conservan su sitio
—para que el formulario no cambie de alto— pero muestran su valor implícito
(`Unidad` y `1`) en el gris de solo lectura, el desplegable pierde su flecha y
ninguno admite foco: se ve que el dato existe y que no se captura ahí. Al pasar a
`Presentación` vuelven a ser editables y recuperan lo último que se hubiera
capturado, de modo que alternar entre los dos alcances no pierde el trabajo ni
deja el formulario a medias. Un campo bloqueado nunca se marca en rojo.

`Cantidad` admite solo dígitos mientras se escribe y se valida como entero mayor
o igual que 1: quedan fuera el vacío, el cero, los decimales, los negativos y lo
no numérico.

#### El tipo y el código externo (CF-51779 / ERB-51772)

`Tipo` es un campo obligatorio de **selección explícita**: lo afirma quien
captura, y arranca en `- Selecciona un tipo -`. El módulo **nunca** lo deduce del
código. El motivo es funcional: si alguien declara `GS1` y el código no cumple la
norma, eso es un error de captura que hay que reportar, no una razón para
reclasificar el registro en silencio como `No GS1`.

Como ayuda, mientras nadie haya declarado el tipo, escribir el código externo lo
**preselecciona** según su aspecto (longitud de GTIN → `GS1`). En cuanto se elige
un tipo a mano la sugerencia se apaga para el resto de la captura, y al editar un
registro existente no se sugiere nunca: su tipo ya viene afirmado. En todos los
casos, el valor que se guarda es el que quede seleccionado en el campo.

La validación vive en una sola función, `validarCodigoExterno(tipo, codigo)`,
que devuelve `{ valido, motivo, mensaje }` y la llaman tanto el alta manual como
la carga masiva: el algoritmo del dígito verificador no está duplicado, así que
un código que un camino rechaza lo rechaza también el otro, con el mismo mensaje.
`motivo` es una clave estable —`vacio`, `etiqueta`, `sscc`, `no-digitos`,
`longitud`, `verificador`— para poder distinguir el caso sin comparar textos.

El tipo declarado decide con qué norma se valida el código:

**`GS1`** — solo dígitos y longitud 8, 12, 13 o 14 (GTIN-8/12/13/14), más el
dígito verificador real de GS1: suma ponderada del cuerpo con pesos alternos 3 y
1, empezando con 3 en el dígito inmediatamente a la izquierda del verificador.
No es Luhn, que alterna 2 y 1 y arrastra los productos de dos cifras. Cada
rechazo lleva su código y su mensaje, de modo que el desglose de la
previsualización distinga un verificador mal de una etiqueta pegada:

| Caso | Código | Mensaje |
| --- | --- | --- |
| Verificador que no cuadra | `VAL-GS1-003` | `El código GS1 tiene un dígito verificador inválido` |
| Longitud fuera de 8/12/13/14 | `VAL-GS1-002` | `El código GS1 tiene una longitud inválida (se esperan 8, 12, 13 o 14 dígitos)` |
| Caracteres que no son dígitos | `VAL-GS1-002` | `El código GS1 debe contener solo dígitos` |
| Cadena GS1-128, con o sin paréntesis | `VAL-GS1-004` | `El código parece una etiqueta GS1-128 completa, captura solo el GTIN` |
| SSCC de 18 dígitos | `VAL-GS1-005` | `El código es un SSCC de 18 dígitos, captura solo el GTIN` |
| Sin capturar | `VAL-EST-004` | `El código externo está vacío` |

El mapa `MOTIVO_A_CODIGO_GS1` traduce el `motivo` que ya devolvía
`validarCodigoExterno` al código de la historia; la lógica de validación no
cambia. `VAL-GS1-001` (tipo de identificador no admitido) queda declarado en el
catálogo, aunque hoy no lo dispara ningún caso: el tipo se valida antes, en su
propia columna.

Un GTIN correcto se guarda en su **forma canónica de 14 posiciones**, rellenando
con ceros a la izquierda. Solo rellena, nunca recorta: `7501234567893` y
`07501234567893` son el mismo código, mientras que `17501234567890` es otro
—su primer dígito es el indicador de nivel de empaque—.

**`No GS1`** — no se le aplica ningún dígito verificador; solo se exige que no
esté vacío. La normalización exacta de los códigos propietarios **está pendiente
de confirmar con negocio** (queda por revisar el anexo *Códigos propietarios
(NO_GS1): normalización y casos de prueba*), así que el código va tal cual: hay
un `TODO` en `app.js` para no dar por cerrada una regla que no se ha validado.

En los dos casos el código se maneja **siempre como texto**. No se convierte a
número en ningún punto del flujo —tampoco al escribir el `.xlsx`, donde los
valores que empiezan por cero se emiten como texto—, porque hacerlo perdería los
ceros a la izquierda y, con códigos largos, acabaría en notación científica.

La carga masiva aplica exactamente la misma validación, tomando el tipo de la
columna `Tipo` del archivo, de modo que un código que el alta manual rechaza lo
rechaza también la importación y al revés.

El catálogo se inventa al cargar la vista: 30 familias de refacción por 30
aplicaciones, 900 productos con código de 7 dígitos agrupados por familia. Los
registros de la tabla toman su código de ese catálogo, de modo que al editar uno se
pueda resolver el nombre de su producto.

`Guardar` permanece deshabilitado, en un verde más claro (`#95D195`), mientras el
formulario esté incompleto, y toma su color pleno al quedar todo capturado. Un
campo visitado que siga vacío o inválido se resalta en rojo también en reposo,
hasta que tenga un valor válido. El código y el proveedor deben corresponder a un
registro existente: no basta escribirlos, hay que elegirlos de la lista. Con todo capturado, la equivalencia se añade al
principio de la tabla: se retira el orden y se vuelve a la primera página para
dejarla a la vista, queda resaltada unos segundos y un toast lo confirma —o
advierte si los filtros activos la dejan fuera—. Los registros nuevos entran
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
hora`, `Usuario`, `Código` y `Proveedor`, con los mismos campos `Buscar` del
encabezado que usa la tabla del catálogo: `Enter` para ejecutar, mínimo 3
caracteres, vaciar el campo retira su filtro y la comparación ignora mayúsculas y
acentos. **Los cuatro filtros se combinan entre sí**, de modo que un usuario y un
código dejan solo los cambios de esa persona sobre ese registro. La fecha se busca
sobre el texto `dd/mm/aaaa hh:mm`, así que `09/2026` acota un mes y `04/09` un día.
Los filtros se conservan al cerrar y reabrir la ventana, para retomar la consulta.

Encabezando la tabla, dos campos cortos de solo lectura pegados al lado
izquierdo —`Entradas` (el total) y `Mostradas` (las que quedan tras los
filtros)— y, en la misma fila al extremo opuesto, la **paginación**, con las
mismas funciones que la de la tabla del catálogo: ventana de cuatro números que
siempre contiene la página en curso, `...` y el número de la última cuando quedan
más, extremos deshabilitados en el gris reservado y la página actual sin acción en
su propio gris. Cambiar de página devuelve el desplazamiento al principio de la
tabla, y filtrar vuelve a la primera página.

En el pie, a la izquierda del botón `Cerrar` y a su misma altura, el selector
`Registros por página` con las opciones 25, 50, 75 y 100 —el mismo control del pie
de la vista principal, desplegándose hacia arriba—. La elección y los filtros se
conservan al cerrar y reabrir la ventana. La tabla crece hasta el 42 % de la
altura de la ventana y a partir de ahí se desplaza internamente con el encabezado
fijo, así que la ventana mide lo mismo con 25 registros por página que con 100.

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
