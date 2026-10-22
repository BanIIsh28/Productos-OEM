# 06 · Reglas de negocio

> **Objetivo:** implementar, **una sola vez cada una**, las reglas que deciden qué
> es una equivalencia válida: destino (RD-MOD-01), código GS1 y tipo
> (CF-51779 / ERB-51772), identidad y unicidad (ERB-51775), y el catálogo de
> incidencias. Estas funciones las consumen el formulario (`05`), la importación
> (`07`) y la bitácora (`08`).

## RD-MOD-01 · Destino

El destino de una equivalencia es **código de producto + alcance + nivel de
empaque + cantidad**; los dos últimos dependen del alcance:

| Alcance | Nivel de empaque | Cantidad |
| --- | --- | --- |
| `Producto` | fijo `Unidad`, **implícito, no se captura** | fija `1`, **implícita, no se captura** |
| `Presentación` | obligatorio, **distinto de `Unidad`**: `Inner` / `Caja máster` / `Pallet` | obligatoria, **entero ≥ 1** |

Cantidad válida: tras recortar espacios, **solo dígitos** (`/^\d+$/`) y valor
numérico **≥ 1**. Quedan fuera vacío, `0`, decimales (`2.5`), negativos y todo lo
no numérico. (Los ceros a la izquierda, como `007`, pasan por ser dígitos de
valor 7.)

Aplica **en el formulario y en la carga masiva**. En la carga masiva, con alcance
`Producto` las celdas `Empaque` y `Cantidad` **pueden venir vacías y se completan
solas** (`Unidad` y `1`); si vienen con otro valor, se rechaza.

| Situación | Código |
| --- | --- |
| Alcance `Producto` y empaque ≠ `Unidad`, o cantidad ≠ `1` | `VAL-EMP-001` |
| Alcance `Presentación` y empaque no es Inner/Caja máster/Pallet, o cantidad no es entero ≥ 1 | `VAL-EMP-002` |
| Falta el dato (celda vacía) con `Presentación` | `VAL-EST-004` |

## CF-51779 / ERB-51772 · Tipo y código proveedor

### El `Tipo` es explícito

Ver `01`. Lo declara el usuario; el sistema nunca lo infiere para guardar.

### `validarCodigoExterno(tipo, codigo)` → `{ valido, motivo, mensaje }`

`motivo` es una clave **estable** (para distinguir casos sin comparar textos):
`vacio`, `etiqueta`, `sscc`, `no-digitos`, `longitud`, `verificador`. Preparación:
`valor = String(codigo ?? '').trim()`.

**Orden de comprobación (importa):**

```
1. valor == ''                                   → vacio
2. tipo != 'GS1'                                 → ACEPTADO  (No GS1: solo no estar vacío; TODO normalización)
3. contiene '(' o ')'                            → etiqueta   (GS1-128 con paréntesis)
4. no son solo dígitos                           → no-digitos
5. longitud == 18                                → sscc       (SSCC, AI 00)
6. longitud > 14 y empieza con '01'              → etiqueta   (GS1-128 sin paréntesis)
7. longitud ∉ {8, 12, 13, 14}                    → longitud
8. dígito verificador incorrecto                 → verificador
9. en otro caso                                  → ACEPTADO
```

Mensajes y códigos de incidencia (`MOTIVO_A_CODIGO_GS1`):

| Caso | Código | Mensaje |
| --- | --- | --- |
| Verificador que no cuadra | `VAL-GS1-003` | `El código GS1 tiene un dígito verificador inválido` |
| Longitud fuera de 8/12/13/14 | `VAL-GS1-002` | `El código GS1 tiene una longitud inválida (se esperan 8, 12, 13 o 14 dígitos)` |
| Caracteres que no son dígitos | `VAL-GS1-002` | `El código GS1 debe contener solo dígitos` |
| Cadena GS1-128 (con o sin paréntesis) | `VAL-GS1-004` | `El código parece una etiqueta GS1-128 completa, captura solo el GTIN` |
| SSCC de 18 dígitos | `VAL-GS1-005` | `El código es un SSCC de 18 dígitos, captura solo el GTIN` |
| Vacío | `VAL-EST-004` | `El código externo está vacío` |

`VAL-GS1-001` (tipo de identificador no admitido) está declarado en el catálogo y
**no lo dispara nada**: el tipo se valida antes, en su propia columna.

### Dígito verificador GS1 (**no es Luhn**)

Suma ponderada del **cuerpo** (todos los dígitos menos el último) con pesos
**alternos 3 y 1, empezando por 3 en el dígito inmediatamente a la izquierda del
verificador**, de derecha a izquierda. Verificador = `(10 − (suma mod 10)) mod 10`.
Luhn alterna 2 y 1 y suma los dígitos de los productos de dos cifras: **da otro
resultado** y no debe usarse.

```
digitoVerificadorGs1(cuerpo):
    suma = 0
    para i = 0 .. len(cuerpo)-1:
        d = dígito en la posición (len-1-i)      // de derecha a izquierda
        suma += d * (i par ? 3 : 1)
    devolver (10 - suma % 10) % 10
```

**Vectores de prueba** (verificados):

| Código | Longitud | Resultado |
| --- | --- | --- |
| `96385074` | 8 | válido (GTIN-8) |
| `036000291452` | 12 | válido (GTIN-12) |
| `4006381333931` | 13 | válido (GTIN-13) |
| `07501234567893` | 14 | válido (GTIN-14) |
| `7501234567893` | 13 | válido; canónico `07501234567893` |
| `17501234567890` | 14 | válido, y es **otro** código (indicador `1`) distinto de `07501234567893` |
| `00036000291452` | 14 | válido; mismo canónico que `036000291452` |
| `7501234567890` | 13 | `VAL-GS1-003` (verificador) |
| `75012345678` | 11 | `VAL-GS1-002` (longitud; **se comprueba la longitud antes que el verificador**) |
| `(01)07501234567893` | — | `VAL-GS1-004` |
| `007501234567890123` | 18 | `VAL-GS1-005` |
| `75012A4567893` | 13 | `VAL-GS1-002` (no dígitos) |

### Forma canónica

Un GTIN correcto se **guarda y compara en forma canónica de 14 posiciones**,
rellenando con ceros a la izquierda. **Solo rellena, nunca recorta.**
`7501234567893` y `07501234567893` son el mismo código; `17501234567890` es otro.

```
codigoCanonico(tipo, codigo) = tipo == 'GS1' ? padIzquierda14(trim(codigo)) : trim(codigo)
```

### `No GS1`

Solo se exige que **no esté vacío**; el código va **tal cual** (texto). La
normalización exacta está **pendiente de confirmar con negocio** (anexo *Códigos
propietarios (NO_GS1): normalización y casos de prueba*). Deja un `TODO` visible
en el código; **no la cierres por tu cuenta**. Longitud máxima de cualquier
código proveedor: **50 caracteres**.

## ERB-51775 · Identidad de una asociación

```
claveAsociacion(proveedor, tipo, codigo, alcance, empaque, cantidad) =
    normalize(proveedor) + '#' + tipo + '#' + codigoCanonico(tipo, codigo) + '#' +
    alcance + '|' + empaque + '|' + cantidad
destinoDe(alcance, empaque, cantidad) = alcance + '|' + empaque + '|' + cantidad
```

Dos filas son **la misma asociación** si tienen la misma clave: proveedor + tipo +
código proveedor (canónico) + destino. *(Nota de alcance: es la comparación
simple; la clave canónica por clase de RD-MOD-02 es una pieza aparte, no incluida.)*

> El **código de producto no forma parte de la clave de asociación.** Por eso
> editar el código de producto de un registro no lo hace chocar consigo mismo.

## Unicidad

### `conflictosDeUnicidad(candidato, excluir)` → lista de `{ codigo, mensaje, fila }`

`candidato = { proveedor, tipo, codigo, alcance, empaque, cantidad }`; `excluir`
es una fila a ignorar (el propio registro al editar; `null` en alta y carga).
Recorre **todos los registros del catálogo** (salvo `excluir`) y devuelve, **una
sola vez por código**, el primer choque de cada clase, en el orden `VAL-UNI-002`,
`003`, `004`:

```
por cada fila f del catálogo (f != excluir):
    si claveDeRegistro(f) == clave(candidato):
         anotar VAL-UNI-002 «Ya existe esta misma asociación en el catálogo ({describe f}, activa|inactiva)»
         continuar con la siguiente fila
    si f.tipo != candidato.tipo                      → siguiente
    si canónico(f.codigo) != canónico(candidato)     → siguiente
    si destino(f) == destino(candidato)              → siguiente
    si candidato.tipo == 'GS1':
         anotar VAL-UNI-003 «El GTIN ya está en el catálogo con otro destino: {describe f}»
    sino si normalize(f.proveedor) == normalize(candidato.proveedor):
         anotar VAL-UNI-004 «Ese proveedor ya usa ese código con otro destino: {describe f}»
```

`describe f` = `código {sku}, {alcance}, {empaque}, cantidad {cantidad}`.

### Qué regla aplica en cada camino

| Código | Qué detecta | Alta/edición manual | Carga masiva (vs. catálogo) | Carga masiva (dentro del archivo) |
| --- | --- | :-: | :-: | :-: |
| `VAL-UNI-001` | Dos filas **del archivo** idénticas (proveedor, tipo, código, destino) | — | — | ✔ |
| `VAL-UNI-002` | Asociación idéntica a una del catálogo | ✔ | **se ignora** (es `sin cambio`/`con aviso`, no error) | — |
| `VAL-UNI-003` | Mismo **GTIN** con **destino distinto**, **sea cual sea el proveedor** | ✔ | ✔ | ✔ |
| `VAL-UNI-004` | Mismo código **No GS1** del **mismo proveedor** con destino distinto | ✔ | ✔ | ✔ |
| `VAL-UNI-005` | Asociación ya existente pero **inactiva** (informativa) | — | clasifica `con aviso` | — |
| `VAL-UNI-006` | Un código propietario admite un solo proveedor | **pendiente, sin disparador** | | |

### Excepción CF-51775-29

Dos filas `No GS1` con el **mismo código propietario**, **proveedores distintos** y
destinos distintos **no generan ninguna incidencia** (cada proveedor es dueño de
sus códigos). Solo choca el *mismo proveedor* (`VAL-UNI-004`). Con `GS1` el
proveedor no importa (`VAL-UNI-003`).

### Orden de aplicación en carga masiva

La unicidad se aplica **viendo el archivo completo**, y **solo sobre las filas que
pasaron su revisión individual** (comparar una fila ya rechazada produciría
incidencias sin sentido). Primero dentro del archivo (001, 003, 004), luego cada
fila limpia contra el catálogo (003, 004).

## Clasificación de filas (carga masiva)

Cada fila útil recibe **exactamente una** clase:

| Clase | Código de resultado | Cuándo | ¿Incidencia? |
| --- | --- | --- | --- |
| Nueva | `RES-FIL-002` | Válida y su clave **no existe** en el catálogo | No |
| Sin cambio | `RES-FIL-001` | Su clave existe y el registro está **activo** | No |
| Con aviso | `RES-FIL-003` | Su clave existe y el registro está **inactivo** | Sí, informativa (`VAL-UNI-005`) |
| Con error | — | Incumple alguna regla | Sí, bloqueante |

Para `sin cambio`/`con aviso` **no se compara el `Estatus` del archivo**: manda el
estado del registro existente. Un aviso **no bloquea**: reactivar se hace desde el
interruptor, no desde la carga masiva.

## Catálogo de incidencias

Contrato de códigos; `severidad` ∈ `ERROR` | `INFORMACION`. En el prototipo va en
línea; en destino debe venir de una fuente externa **conservando los códigos**.

| Código | Alias | Sev. | Corrección recomendada |
| --- | --- | --- | --- |
| `VAL-MAE-001` | El código no existe o está inactivo | ERROR | Verifica el código contra el catálogo de productos. |
| `VAL-MAE-002` | El proveedor no está registrado | ERROR | Da de alta al proveedor o corrige su nombre. |
| `VAL-UNI-001` | Duplicado exacto dentro del archivo | ERROR | Deja una sola fila con esa combinación y vuelve a cargar el archivo. |
| `VAL-UNI-002` | Asociación duplicada | ERROR | Ya existe una asociación idéntica (mismo proveedor, tipo, código y destino). Edítala en vez de crear una nueva. |
| `VAL-UNI-003` | GTIN con destino incompatible | ERROR | Un mismo GTIN no puede apuntar a dos destinos distintos, sea cual sea el proveedor. Unifica el destino. |
| `VAL-UNI-004` | Código propietario con destino incompatible | ERROR | Un mismo código propietario del mismo proveedor no puede apuntar a dos destinos distintos. Unifica el destino. |
| `VAL-UNI-005` | Asociación inactiva en el catálogo | INFORMACION | La reactivación se hace desde la pantalla de baja y reactivación, no desde la carga masiva. |
| `VAL-UNI-006` | El código admite una sola asociación de proveedor | ERROR | Un código propietario (No GS1) solo puede tener un proveedor asociado. Registra el otro proveedor con su propio código. *(declarado, sin disparador)* |
| `VAL-EST-001` | Hoja "Carga_Equivalencias" no encontrada | ERROR | Descarga la plantilla del módulo y captura sobre ella, sin renombrar la hoja. |
| `VAL-EST-002` | Estructura de columnas incorrecta | ERROR | La hoja debe traer exactamente las columnas de la plantilla, en el mismo orden y sin columnas de más. |
| `VAL-EST-003` | El archivo no tiene filas útiles | ERROR | Captura al menos un registro debajo de los encabezados. |
| `VAL-EST-004` | Campo obligatorio vacío | ERROR | Captura el dato que falta. |
| `VAL-EST-005` | Valor con tipo, formato o longitud no admitidos | ERROR | Corrige el valor para que cumpla lo que admite la columna. |
| `VAL-EST-006` | La celda contiene una fórmula | ERROR | Sustituye la fórmula por su resultado como texto y vuelve a guardar el archivo. |
| `VAL-EST-007` | El archivo supera el límite de filas | ERROR | Divide la carga en archivos de 50,000 filas o menos. |
| `VAL-GS1-001` | Tipo de identificador GS1 no admitido | ERROR | Declara uno de los tipos de identificador que admite la carga. *(sin disparador)* |
| `VAL-GS1-002` | Longitud o caracteres inválidos en el código GS1 | ERROR | Un GTIN son 8, 12, 13 o 14 dígitos, sin letras ni separadores. |
| `VAL-GS1-003` | Dígito verificador GS1 inválido | ERROR | Verifica el código de barras contra el producto físico o el catálogo del proveedor. |
| `VAL-GS1-004` | Cadena GS1-128 completa en lugar del identificador | ERROR | Captura solo el GTIN, sin los identificadores de aplicación que acompañan a la etiqueta. |
| `VAL-GS1-005` | SSCC del AI (00) en lugar del identificador | ERROR | El SSCC identifica una unidad logística, no un producto: captura el GTIN. |
| `VAL-EMP-001` | Destino incompatible con Producto | ERROR | Con alcance Producto el nivel de empaque es Unidad y la cantidad 1; puedes dejar ambas celdas vacías. |
| `VAL-EMP-002` | Destino incompatible con Presentación | ERROR | Elige un nivel de empaque distinto de Unidad y una cantidad entera de 1 o más. |

No existe `VAL-CAM-*`: es un nombre antiguo e inventado. **No lo uses.**

## Criterios de aceptación

- [ ] Los 12 vectores de la tabla dan el resultado indicado, con su código.
- [ ] `7501234567893` se guarda como `07501234567893`; `17501234567890` se trata
      como un código distinto.
- [ ] Declarar `GS1` con un código mal formado **rechaza**; no reclasifica.
- [ ] La validación del código vive en **una** función y la usan formulario e
      importación (buscar el algoritmo del verificador: debe aparecer una vez).
- [ ] `conflictosDeUnicidad` es **una** función; formulario e importación la llaman.
- [ ] Dos `No GS1` con mismo código y **proveedores distintos** → sin incidencia.
- [ ] Una fila idéntica a un registro activo del catálogo es `sin cambio`, **no**
      error en carga masiva; en el formulario sí es `VAL-UNI-002`.
- [ ] Editar un registro sin tocar su identidad no dispara `VAL-UNI-002`.
