# 01 · Prompt maestro y reglas generales

> Pega esto primero. Vale para todos los prompts siguientes.

## Prompt maestro

```
Vas a construir el módulo «Productos OEM» de un administrador de operaciones
(marca Apymsa): un catálogo de EQUIVALENCIAS entre un producto propio y el
código con que un proveedor lo identifica. Se opera en español de México.

Recibirás la especificación por partes, en orden. Cada parte trae objetivo,
especificación y criterios de aceptación. Reglas de trabajo:

1. El COMPORTAMIENTO descrito es el requisito; la tecnología no. Usa el stack
   del sistema destino, pero no cambies ningún comportamiento, mensaje, código
   de incidencia, color ni medida sin avisar.
2. No improvises reglas de negocio. Si algo no está especificado, usa la opción
   más conservadora, anótala como SUPUESTO en tu respuesta y sigue; no la
   presentes como regla.
3. Cada regla de negocio se implementa UNA sola vez, en una función compartida,
   y todos los caminos que la necesitan la llaman (ver «Una sola fuente de
   verdad»).
4. Antes de dar una parte por terminada, verifícala ejecutándola en un
   navegador real (no solo leyendo el código) contra sus criterios de
   aceptación. Informa de lo que falló, no solo de lo que pasó.
5. Nunca marques como hecho lo que dejaste a medias. Si algo queda fuera,
   dilo con su motivo.
6. Si encuentras una contradicción entre dos partes de la especificación, o
   entre la especificación y lo que pide una regla del negocio, detente en ese
   punto, señálala en una o dos frases y propón una resolución; no escojas en
   silencio.
```

## Principios innegociables

### Vocabulario (no se negocia)

| Dilo así | Nunca así |
| --- | --- |
| **Código** (de producto) | SKU |
| **Código proveedor** | Código externo |
| **Equivalencia** | Mapeo, relación |
| **Bitácora** | Log, historial (en la UI) |
| **Previsualización** | Preview, vista previa |

«SKU» y «Código externo» siguen apareciendo en nombres internos y comentarios del
prototipo por historia; **en pantalla, en archivos `.xlsx` y en mensajes** solo
los términos de la columna izquierda.

### Una sola fuente de verdad por regla

| Regla | Función única | La usan |
| --- | --- | --- |
| Validar un código proveedor según su tipo | `validarCodigoExterno(tipo, codigo)` → `{ valido, motivo, mensaje }` | alta/edición manual **y** carga masiva |
| Forma guardada de un código | `codigoCanonico(tipo, codigo)` | todos |
| Identidad de una asociación | `claveAsociacion(proveedor, tipo, codigo, alcance, empaque, cantidad)` | clasificación, unicidad |
| Choques de unicidad contra el catálogo | `conflictosDeUnicidad(candidato, excluir)` | alta/edición manual **y** carga masiva |
| Modificar un registro | `commitAlta`, `commitEdicion`, `commitEstatus` | toda acción que cambie datos |

Si el alta manual rechaza algo, la carga masiva lo rechaza con el **mismo
código y el mismo mensaje**, y al revés. Duplicar la lógica «porque son dos
pantallas» fue justo lo que se evitó.

### El rastro no depende de la memoria de quien llama

Ninguna alta, edición, baja o reactivación puede ocurrir sin dejar entrada en la
bitácora, y eso se garantiza **estructuralmente**: las únicas funciones capaces
de modificar un registro son las tres `commit*`, y cada una anota en el mismo
paso en que aplica el cambio. No existe «modificar y luego anotar». El origen
(`Manual`/`Archivo`) se marca igual: lo pone el contexto, no un parámetro que
alguien deba acordarse de pasar.

### `Tipo` es una afirmación del usuario, nunca una deducción

`GS1` / `No GS1` lo declara quien captura. El sistema **jamás** lo infiere del
código para guardar. Razón funcional: si alguien declara `GS1` y el código no
cumple la norma, es un **error de captura que hay que reportar**, no un motivo
para reclasificarlo en silencio como `No GS1`. (Única concesión: una
*preselección de comodidad* mientras nadie haya elegido tipo; ver `05`.)

### Los códigos son texto, siempre

Códigos de producto, GTIN y códigos propietarios se tratan **como texto en todo
el flujo**: en memoria, en pantalla, al leer y al escribir `.xlsx`. Convertirlos
a número pierde los ceros a la izquierda y, con códigos largos, produce notación
científica. Nunca `Number()`/`parseInt()` sobre un código para guardarlo,
compararlo u ordenarlo por valor textual.

### `U. de M.` se muestra, no se guarda

Dato **del producto**, no de la equivalencia. Se deriva del código; **no se
captura, no se persiste, no genera bitácora y no viaja** en plantilla,
exportación, previsualización ni archivo de carga.

### Lectura de filas por posición del dato, nunca por posición visual

Cada columna declara con qué posición **del dato** se corresponde
(`dataIndex`). Las columnas calculadas o de control (`U. de M.`, `Acciones`) no
leen dato (`null`). Render, orden, buscadores y exportación usan siempre ese
índice. Ver `10`.

### Códigos de incidencia estables

Las incidencias llevan los códigos de la historia (`VAL-EST-004`, `VAL-GS1-003`,
`VAL-UNI-003`…), con alias, severidad y corrección. Son contrato: la UI, los
filtros y las pruebas dependen de ellos. No renombrar, no inventar sustitutos.

### Estados de la interfaz

- Un control **deshabilitado** usa siempre el gris `rgb(211,211,211)` y no
  reacciona al `hover`. Ese gris está *reservado* para ese estado.
- Texto a **12 px** en todo el módulo (excepciones en `03`).
- Un campo **bloqueado** nunca se marca en rojo.
- Pulsar el fondo de una ventana modal **no** la cierra (evita perder lo
  capturado).

## Glosario

| Término | Significado |
| --- | --- |
| Equivalencia / asociación | Fila: producto + proveedor + código del proveedor + destino |
| Destino | `alcance + empaque + cantidad` (más el código de producto) |
| Alcance | `Producto` (la unidad suelta) o `Presentación` (un empaque agrupado) |
| Empaque (nivel) | `Unidad`, `Inner`, `Caja máster`, `Pallet` |
| GTIN | Identificador GS1 de 8, 12, 13 o 14 dígitos |
| Forma canónica | GTIN rellenado con ceros a la izquierda hasta 14 posiciones |
| `GS1` / `No GS1` | Tipo del código proveedor: GTIN normado vs. código propietario |
| Fila útil | Fila bajo el encabezado de un archivo que trae algo |
| Operación (`CARGA-00N`) | Una carga masiva; agrupa sus entradas en la bitácora |
