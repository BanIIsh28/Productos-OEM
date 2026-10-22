# 05 · Ventanas modales, toasts y formulario de equivalencia

> **Objetivo:** el sistema de ventanas del módulo y el formulario de alta/edición,
> con su validación en vivo. Las reglas de fondo (GS1, destino, unicidad) están en
> `06`; aquí se describe cómo se *comportan* en el formulario.

## `openModal(opciones)`

Una sola ventana abierta a la vez: abrir otra cierra la anterior.

| Opción | Significado |
| --- | --- |
| `title` | texto de la cabecera |
| `body` | nodo con el contenido |
| `buttons[]` | `{ label, variant: 'cancel'\|'save', onClick }`; el pie los coloca a la derecha |
| `wide` / `xwide` | ancho para tablas (hasta 1340 px) |
| `aside` | control a la **izquierda** del pie (p. ej. «Registros por página») |
| `note` | leyenda en el pie, junto a los botones (texto rojo) |
| `onClose` | se invoca al cerrar |

Devuelve `{ close, element }`.

**Cierre:** con la `X`, con `Escape` o con cualquier botón. **Pulsar el fondo no
cierra** (para no perder lo capturado). **Si el `onClick` de un botón devuelve
`false`, la ventana permanece abierta** (se usa para validaciones que fallan y
para «Descargar» en la bitácora).

## `confirmModal({ title, message, accept, onAccept })`

Ventana de solo texto, mismas dimensiones y línea que el formulario. Botones
`Cancelar` (rojo) y `Aceptar` (verde, o el texto de `accept`). **Solo `Aceptar`
ejecuta la acción**; `Cancelar`, `X` y `Esc` no hacen nada. La usa el interruptor
de `Estatus` (ver `04`).

## `showToast(mensaje, tipo)`

`tipo` ∈ `error` (rojo), `success` (verde), `warning` (ámbar). Apariencia y
animación en `03`. Duran 4 s. Regla de uso: **éxito** cuando la acción se
completó y es plenamente visible; **advertencia** cuando se completó pero algo
requiere atención (típicamente: el registro no se ve con los filtros vigentes);
**error** cuando la acción no se realizó.

## Formulario de equivalencia

Una sola ventana para **alta** (botón `Agregar equivalencia +`, título
`Agregar equivalencia`) y **edición** (lápiz, título `Editar equivalencia`).
Botones: `Cancelar` (rojo) y `Guardar` (verde).

### Distribución (rejilla de 6 columnas)

| Fila | Campos (ancho en columnas) |
| --- | --- |
| 1 | `Código` (2, con búsqueda) · `Nombre del producto` (4, solo lectura) |
| 2 | `U. de M.` (2, solo lectura) · `Proveedor` (4, con búsqueda) |
| 3 | `Tipo` (2) · `Código proveedor` (4) |
| 4 | `Alcance` (2) · `Empaque` (2) · `Cantidad` (2) — el destino |

> `U. de M.` va **antes** que `Proveedor` en la fila 2, en alta y en edición,
> conservando las longitudes de cada uno.

### Campos con búsqueda (`Código`, `Proveedor`)

- `Código` (placeholder `Código de producto`): **solo admite dígitos**. A partir
  de **3 dígitos** despliega los productos cuyo código **contiene** lo escrito,
  cada uno como el código seguido del nombre. Se ven **5 a la vez**; el resto con
  scroll. Sin resultados: `Sin coincidencias`. **Elegir** uno llena `Código`,
  `Nombre del producto` **y `U. de M.`** (derivada del código).
- `Proveedor` (placeholder `Nombre del proveedor`): igual, sobre los nombres del
  maestro (contiene, sin acentos ni mayúsculas). Se guarda el nombre **tal como
  aparece en el catálogo**.
- **Validez:** `Código` y `Proveedor` deben corresponder a un registro **existente**
  del catálogo (se comprueba contra el catálogo, no solo por formato). La forma
  prevista de captura es elegirlos de la lista.
- El menú se cierra al perder el foco, al elegir y con `Esc`; **`Esc` dentro del
  menú abierto solo cierra el menú, no la ventana** (detiene la propagación).

> *Salvedad del prototipo:* teclear a mano un código **completo y existente** lo da
> por válido, pero `Nombre del producto` y `U. de M.` **solo se llenan al elegir
> de la lista**, y no se vacían si luego se edita el texto. Es un resquicio, no una
> regla; en el sistema destino conviene llenar ambos cuando el texto coincida
> exactamente con un producto, y vaciarlos cuando deje de coincidir. Avísalo si lo
> corriges.

### Desplegables

Placeholders (primer elemento, no seleccionable como valor válido):
`- Selecciona un tipo -`, `- Selecciona un alcance -`, `- Selecciona un empaque -`.
`Empaque` ofrece **solo** `Inner`, `Caja máster`, `Pallet`: **`Unidad` nunca se
elige a mano**.

### Comportamiento del destino según el alcance

| Alcance | `Empaque` | `Cantidad` |
| --- | --- | --- |
| `Producto` | muestra `Unidad`, bloqueado | muestra `1`, bloqueado |
| `Presentación` | desplegable editable, obligatorio | solo dígitos, entero ≥ 1, obligatorio |

- Con `Producto`, ambos campos **conservan su sitio** (el formulario no cambia de
  alto) pero muestran su valor implícito en el **gris de solo lectura**; el
  desplegable **pierde su flecha** (`--locked`) y ninguno admite foco. **Un campo
  bloqueado nunca se marca en rojo.**
- Al volver a `Presentación` recuperan **lo último que se hubiera capturado**
  (se recuerda aparte): alternar entre alcances **no pierde el trabajo** ni deja
  el formulario a medias.
- `Cantidad` admite **solo dígitos** al teclear y se valida como entero ≥ 1:
  quedan fuera vacío, cero, decimales, negativos y no numérico. Mensaje:
  `La cantidad debe ser un número entero mayor o igual a 1`.

### `Tipo` y `Código proveedor`

- `Tipo` es **selección explícita**, obligatoria, arranca en `- Selecciona un
  tipo -`. **Nunca se deduce para guardar.**
- *Preselección de comodidad:* mientras **nadie haya declarado el tipo**, teclear
  en `Código proveedor` lo **preselecciona** según su aspecto (longitud de GTIN →
  `GS1`). En cuanto el usuario elige un tipo a mano, **la sugerencia se apaga para
  el resto de la captura**. **Al editar un registro existente no se sugiere
  nunca** (su tipo ya viene afirmado). El valor guardado es siempre el que quede
  seleccionado.
- `Código proveedor` se valida en vivo con `validarCodigoExterno(tipoSeleccionado,
  texto)` (ver `06`). Cambiar de tipo **revalida** el código con la norma nueva.
  Al guardar se almacena `codigoCanonico(tipo, código)`.

### Estado de `Guardar` y marcado de errores

- **`Guardar` deshabilitado** (verde claro `#95D195`, conserva su tamaño) mientras
  el formulario esté incompleto o inválido; toma su verde pleno al quedar todo
  correcto. «Correcto» = `Código` y `Proveedor` elegidos del catálogo, tipo
  elegido, código proveedor válido para su tipo, alcance elegido y, solo si es
  `Presentación`, empaque válido y cantidad válida.
- **Marcado en rojo (`input--invalid`)** de un campo *visitado* que siga vacío o
  inválido, **también en reposo**, hasta que tenga un valor válido. Un campo que
  nadie tocó no se pinta en rojo de entrada.
- Si de todos modos se intenta guardar con datos malos: se marcan los campos, se
  muestra un toast de **error** (`Falta capturar X` / `Faltan datos por capturar:
  A, B` y, aparte, el mensaje del código o de la cantidad inválidos, unidos con
  `. `) y **la ventana permanece abierta**.

### Unicidad al guardar (alta **y** edición)

Con todo válido, **antes** de aplicar el cambio se llama a
`conflictosDeUnicidad(candidato, excluir)` (ver `06`) y, si devuelve algo, se
rechaza el guardado:

- se marca `Código proveedor` en rojo;
- toast de **error**: `{CÓDIGO} · {mensaje}. {corrección recomendada}` (p. ej.
  `VAL-UNI-003 · El GTIN ya está en el catálogo con otro destino: código
  1001293, Presentación, Caja máster, cantidad 24. Un mismo GTIN no puede apuntar
  a dos destinos distintos, sea cual sea el proveedor. Unifica el destino.`);
- **la ventana permanece abierta** y no se agrega ni cambia nada.

En **edición** el propio registro se excluye de la comparación: reabrir una
equivalencia y cambiar algo ajeno a su identidad (p. ej. el código de producto) no
la hace chocar consigo misma.

### Alta

1. Valida (campos y unicidad). 2. `commitAlta(fila)` (anota en la bitácora).
3. Se **retira el orden**, se vuelve a la **página 1**, la fila queda **resaltada
4 s**. 4. Toast: éxito `Se agregó la equivalencia del código {código}`; si los
filtros vigentes **la dejan fuera** (se comprueba con `filteredRows().indexOf(fila)
!== -1`): **warning** `Se agregó la equivalencia del código {código}, aunque no se
muestra con los filtros aplicados`. **Los registros nuevos entran activos.**

### Edición

- Llega con los datos cargados (incluida `U. de M.` precargada), título `Editar
  equivalencia`. **`Guardar` espera a que se modifique algún dato** respecto al
  registro original.
- El **estatus no se edita aquí**: solo con el interruptor de la tabla.
- Se aplica con `commitEdicion` sobre **el mismo registro** (una entrada de
  bitácora por campo cambiado; sin cambios reales no hay entradas). Queda
  resaltado 4 s. Toast: éxito `Se actualizó la equivalencia del código
  {código}`; si los filtros ya no lo muestran, **warning** `…, aunque ya no se
  muestra con los filtros aplicados`.

## Criterios de aceptación

- [ ] Esc, `X` y botones cierran; clic en el fondo **no**.
- [ ] Un `onClick` que devuelve `false` mantiene la ventana abierta.
- [ ] `Código` no admite letras; con <3 dígitos no hay sugerencias; con ≥3 se ven
      5 y el resto con scroll; elegir llena nombre **y** `U. de M.`; `Esc` con el
      menú abierto cierra solo el menú.
- [ ] Con alcance `Producto`, `Empaque`=`Unidad` y `Cantidad`=`1` se ven
      bloqueados en gris, sin flecha, nunca en rojo; al pasar a `Presentación` y
      volver, se recupera lo capturado.
- [ ] `Guardar` (verde claro) se habilita solo con el formulario correcto.
- [ ] Declarar `GS1` y escribir un código con verificador malo deja el campo en
      rojo; **no** cambia el tipo a `No GS1`.
- [ ] La preselección de tipo se apaga al elegir tipo a mano y no ocurre al editar.
- [ ] Alta: aparece arriba, resaltada 4 s, página 1, toast correcto (verde o ámbar).
- [ ] Alta que choca (UNI-002/003/004): toast rojo, campo rojo, ventana abierta,
      nada se agrega. Edición sin tocar identidad: guarda sin chocar consigo misma.
- [ ] Editar: `Guardar` apagado hasta cambiar algo.
