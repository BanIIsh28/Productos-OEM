# Paquete de replicación — módulo «Productos OEM»

Conjunto de prompts y reglas para que **otra sesión** (u otro equipo, en otro
sistema) reconstruya el módulo completo con sus características y, sobre todo,
con sus **comportamientos**. Está redactado a partir del prototipo vivo de este
repositorio (rama `claude/productos-oem-module-0wrydm`, estado `bd29221`), no de
memoria: cada cifra, color y mensaje de aquí existe en el código.

## Cómo usarlo

1. Pega **`01-reglas-generales.md`** al inicio de la sesión: es el prompt maestro
   y las reglas que valen para todo lo demás.
2. Entrega los archivos **`02` a `08` en orden**, uno por turno. Cada uno es un
   prompt autocontenido con *Objetivo*, *Especificación* y *Criterios de
   aceptación*. No avances al siguiente hasta que el anterior cumpla los suyos.
3. Termina con **`09-verificacion.md`** (lista de comprobación y escenarios de
   prueba) y revisa **`10-trampas-y-decisiones.md`** *antes* de empezar: son los
   errores que ya se cometieron una vez y que cuestan caro repetir.

| Archivo | Contenido | Depende de |
| --- | --- | --- |
| `01-reglas-generales.md` | Prompt maestro, principios innegociables, glosario | — |
| `02-datos-y-dominio.md` | Registro, columnas, catálogos, unidad de medida, datos de arranque | 01 |
| `03-interfaz-visual.md` | Línea gráfica: layout, colores, medidas, componentes | 01 |
| `04-tabla-filtros-paginacion.md` | Tabla, filtros, buscadores, orden, paginación, interruptor | 02, 03 |
| `05-formulario-y-modales.md` | Sistema de ventanas, toasts, formulario de alta/edición | 03, 04 |
| `06-reglas-de-negocio.md` | Destino, GS1, tipo, unicidad, catálogo de incidencias | 02 |
| `07-excel-e-importacion.md` | Plantilla, exportación, lector/escritor `.xlsx`, previsualización | 05, 06 |
| `08-bitacora.md` | Historial de cambios, origen, descarga | 05, 06, 07 |
| `09-verificacion.md` | Criterios de aceptación y escenarios de prueba | todos |
| `10-trampas-y-decisiones.md` | Errores previos y decisiones que no deben revertirse | — |

## Qué es real y qué es simulado en el prototipo

El prototipo es un front-end sin servidor. Al trasladarlo, **sustituye lo
simulado y conserva el comportamiento**:

| En el prototipo | En el sistema destino |
| --- | --- |
| Catálogo de 900 productos generado por fórmula | Maestro real de productos |
| 40 proveedores en una lista | Maestro real de proveedores |
| `U. de M.` derivada del código con una suma de caracteres | `ProductoUnidadMedidaID` real del producto |
| Usuario `10345` fijo y lista de 6 usuarios | Usuario autenticado (≤ 5 dígitos) |
| 183 registros y su historial generados al azar al abrir | Datos persistidos |
| Cambios solo en memoria (recargar los pierde) | Persistencia transaccional |
| Catálogo de incidencias en línea (`INCIDENCIAS`) | Fuente externa de códigos, alias, severidad y corrección |
| Validación en el navegador | **Misma validación en servidor**; la del navegador es comodidad, no garantía |

## Pendientes declarados (no los inventes)

Quedan fuera a propósito, con su hueco señalado en el código:

- `VAL-UNI-006` (un código propietario admite un solo proveedor): declarado en el
  catálogo, **nada lo dispara** hasta separar *equivalencia canónica* de
  *asociación de proveedor*.
- `VAL-PRV-001/002` (matriz proveedor-identificador OEM/no-OEM) y `VAL-MAE-003`
  (nivel de empaque inexistente o inactivo): falta el dato en el catálogo simulado.
- `RD-MOD-02` (clave canónica distinta por clase, que agrupa varias filas GS1 en
  una sola equivalencia): no está. La identidad de una asociación es hoy la
  comparación simple descrita en `06`.
- Normalización de códigos `No GS1`: **pendiente de confirmar con negocio**
  (anexo *Códigos propietarios (NO_GS1): normalización y casos de prueba*). El
  código va tal cual; hay un `TODO` a propósito.
- `VAL-GS1-001` (tipo de identificador no admitido): declarado, sin disparador.

## Referencia en este repositorio

El detalle exhaustivo vive en `README.md` (comportamiento) y `ejemplos/README.md`
(archivos de prueba). Código: `app.js` (datos y comportamiento), `styles.css`,
`modal.js`, `toast.js`, `xlsx.js` (escritor), `xlsx-read.js` (lector). Si algo de
este paquete contradice al código, **gana el código**; avisa de la discrepancia.
