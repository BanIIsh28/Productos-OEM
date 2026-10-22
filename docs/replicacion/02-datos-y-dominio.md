# 02 · Datos y dominio

> **Objetivo:** definir el registro, las columnas, los catálogos y los datos de
> arranque, de modo que todo lo demás pueda apoyarse en ellos.

## El registro

Cada equivalencia es una fila de **8 datos**, en este orden (posición = `dataIndex`):

| # | Dato | Valores |
| --- | --- | --- |
| 0 | Código | texto de 7 dígitos; debe existir en el catálogo de productos |
| 1 | Proveedor | nombre; debe existir en el maestro de proveedores |
| 2 | Tipo | `GS1` \| `No GS1` |
| 3 | Código proveedor | texto; GTIN canónico (14) si `GS1`; propietario si `No GS1`; máx. 50 caracteres |
| 4 | Alcance | `Producto` \| `Presentación` |
| 5 | Empaque | `Unidad` \| `Inner` \| `Caja máster` \| `Pallet` |
| 6 | Cantidad | texto con entero ≥ 1 |
| 7 | Estatus | booleano; se muestra `Activo` / `Inactivo` |

Constantes con nombre: `COL_SKU=0`, `COL_PROVEEDOR=1`, `COL_TIPO=2`,
`COL_ALCANCE=4`, `COL_ESTATUS=7`. Constantes de destino: `NIVEL_UNIDAD='Unidad'`,
`CANTIDAD_UNIDAD='1'`, `NIVELES_EMPAQUE=['Inner','Caja máster','Pallet']`,
`ALCANCES=['Producto','Presentación']`, `TIPOS=['GS1','No GS1']`.

## Columnas de la tabla

`dataIndex` es **la posición del dato dentro de la fila**, no la posición de la
columna en pantalla:

| Columna (pantalla) | `dataIndex` | Orden | Buscador | Notas |
| --- | --- | --- | --- | --- |
| Código | 0 | numérico | sí | |
| U. de M. | `null` | — | no | **calculada**, control `unidad` |
| Proveedor | 1 | alfabético | sí | |
| Tipo | 2 | — | no | |
| Código proveedor | 3 | — | sí | |
| Alcance | 4 | — | no | |
| Empaque | 5 | — | no | |
| Cantidad | 6 | — | no | |
| Estatus | 7 | — | no | control `switch` |
| Acciones | `null` | — | no | control `actions` (lápiz) |

Solo `Código` y `Proveedor` ordenan. Solo `Código`, `Proveedor` y `Código
proveedor` tienen buscador.

## Unidad de medición (RD-MOD-06)

Dato del producto, derivado **de forma determinística** del código (el mismo
producto muestra siempre la misma unidad en cualquier sesión). Valores: `Metro`,
`Pieza`, `Juego`, `No disponible`.

```
unidadDe(codigo):
    suma = suma de los códigos de carácter (charCodeAt) de cada dígito del código
    si suma % 11 == 0  → 'No disponible'
    en otro caso       → ['Metro','Pieza','Juego'][suma % 3]
```

Con el catálogo de 900 productos, unos 84 quedan en `No disponible`. En el
sistema destino esto **se sustituye** por la unidad real del producto
(`ProductoUnidadMedidaID`); lo que se conserva es: se muestra, se filtra, no se
captura y no se persiste en la equivalencia.

## Catálogo de productos (simulado, determinístico)

30 familias × 30 aplicaciones = 900 productos. **Es siempre el mismo** (se deriva
de la posición, no del azar) para que un archivo de carga preparado de antemano
siga siendo válido en cualquier sesión.

```
para f en 0..29 (familia FAMILIAS[f]):
  prefijo = String(100 + f)                       // '100', '101', …
  para i en 0..29 (aplicación APLICACIONES[i]):
     sufijo = String(1000 + ((i*293 + f*37) % 9000))
     producto = { codigo: prefijo + sufijo,       // 7 dígitos
                  nombre: FAMILIAS[f] + ' — ' + APLICACIONES[i] }
```

Ejemplos que usan los archivos de prueba: `1001000` = *Balata delantera
cerámica — Nissan Tsuru 1.6*; `1001293` = *… Nissan Versa 1.6*; `1023711` = *Filtro
de aceite — Ford Ranger 2.5*; `1054701` = *Bujía de iridio — Toyota Corolla 1.8*;
`1175731` = *Alternador — Honda Civic 1.8*; `1256613` = *Maza de rueda — Mazda 3
2.0*.

**FAMILIAS** (índice 0→29): Balata delantera cerámica · Balata trasera
semimetálica · Filtro de aceite · Filtro de aire · Filtro de cabina · Bujía de
iridio · Amortiguador delantero · Amortiguador trasero · Banda de distribución ·
Banda accesorios · Bomba de agua · Disco de freno ventilado · Tambor de freno ·
Rótula inferior · Terminal de dirección · Kit de clutch · Radiador de aluminio ·
Alternador · Motor de arranque · Sensor de oxígeno · Bomba de gasolina · Junta de
cabeza · Retén de cigüeñal · Soporte de motor · Horquilla de suspensión · Maza de
rueda · Cilindro maestro de freno · Bobina de encendido · Termostato · Válvula PCV.

**APLICACIONES** (índice 0→29): Nissan Tsuru 1.6 · Nissan Versa 1.6 · Nissan
March 1.6 · VW Jetta A4 · VW Vento 1.6 · VW Gol 1.6 · Chevrolet Aveo 1.6 ·
Chevrolet Spark 1.2 · Chevrolet Silverado 5.3 · Ford Ranger 2.5 · Ford Figo 1.5 ·
Ford F-150 5.0 · Toyota Corolla 1.8 · Toyota Hilux 2.7 · Honda Civic 1.8 · Honda
CR-V 2.4 · Mazda 3 2.0 · Mazda CX-5 2.5 · Kia Rio 1.6 · Hyundai Accent 1.6 ·
Renault Logan 1.6 · Renault Duster 2.0 · Seat Ibiza 1.6 · Suzuki Swift 1.4 ·
Dodge Attitude 1.5 · RAM 700 1.6 · Jeep Compass 2.4 · Peugeot 208 1.6 · Fiat Uno
1.4 · Mitsubishi L200 2.4.

## Maestro de proveedores (simulado)

40 nombres; la comparación de nombres ignora mayúsculas y acentos
(`normalize`): Robert Bosch México · Denso Refacciones · Delphi Technologies ·
Valeo Service · Gates de México · SKF Rodamientos · Monroe Amortiguadores · Moog
Suspensiones · ACDelco Distribuidor · Mahle Componentes · NGK Bujías · TRW Frenos ·
Sachs Embragues · Timken Rodamientos · Dana Transmisiones · Brembo Frenos · KYB
Suspensión · Mann-Filter México · Hella Iluminación · Aisin Autopartes · Autopartes
del Norte · Refaccionaria Central · Grupo Refaccionario Bajío · Partes Diésel
Monterrey · Distribuidora Sáenz Autopartes · Refacciones El Águila ·
Comercializadora Vega Motors · Importaciones Bravo Auto · Suministros Automotrices
Lerma · Refaccionaria La Curva · Autopartes Peninsular · Grupo Tecnomotriz ·
Refacciones Industriales Torreón · Distribuidora Motriz del Pacífico · Componentes
Vallarta · Refaccionaria San Andrés · Autopartes Zaragoza · Proveedora Mecánica
Altamira · Refacciones Querétaro Express · Grupo Automotriz Robles.

### `normalize(texto)`

`minúsculas` → descomponer Unicode (NFD) → quitar marcas diacríticas
(`̀–ͯ`). Se usa en **toda** comparación de texto (buscadores, nombres
de proveedor, claves de asociación, filtros de bitácora).

## Datos de arranque (solo para el demo)

Al abrir la vista se generan **183 registros**: una fila ancla fija + 182
aleatorias.

**Fila ancla** — fija a propósito para que los archivos de ejemplo puedan
demostrar la unicidad contra el catálogo de forma reproducible en cualquier
sesión (el resto es aleatorio, así que un código fijo en un `.xlsx` no tendría
con qué chocar):

```
['1001293', 'Robert Bosch México', 'GS1', '07500001234563',
 'Presentación', 'Caja máster', '24', true]
```

**Las 182 aleatorias**, sin repetir código de producto:

- `alcance` al azar; si es `Producto` → empaque `Unidad`, cantidad `1`; si es
  `Presentación` → empaque al azar de `NIVELES_EMPAQUE`, cantidad entera 2–20.
- `tipo` al azar; el código proveedor **coherente con su tipo**:
  - `GS1`: GTIN-14 válido — primer dígito 0–3, 12 dígitos al azar, y el 14.º es
    el dígito verificador GS1 correcto.
  - `No GS1`: prefijo de `['AP','RF','MX','TC','NGK','DEN']` + `-` + 6
    caracteres alfanuméricos (p. ej. `TC-869755`).
- ~70 % activos.

En el sistema destino esto es **datos reales**; la fila ancla solo se conserva
si se quiere reproducir el demo con los archivos de `ejemplos/`.

## Criterios de aceptación

- [ ] El registro tiene 8 datos en ese orden y las columnas declaran `dataIndex`.
- [ ] `U. de M.` y `Acciones` llevan `dataIndex: null`; ningún código lee una fila
      usando la posición de la columna.
- [ ] El catálogo de productos produce los mismos 900 códigos en cualquier
      sesión; `1001000` resuelve a *Balata delantera cerámica — Nissan Tsuru 1.6*.
- [ ] `unidadDe('1001000')` es idempotente entre sesiones.
- [ ] Los datos de arranque respetan la coherencia tipo↔código y alcance↔destino.
