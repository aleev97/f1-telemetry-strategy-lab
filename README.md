# F1/Lab · Telemetry & Strategy Lab

Aplicación web para explorar la temporada de Fórmula 1: calendario con cuenta regresiva, comparación de telemetría entre dos pilotos y un simulador de estrategia de boxes que calcula en tiempo real.

> Proyecto personal

## Qué hace

| Pantalla | Qué ofrece |
|---|---|
| **Calendario** `/` | Cuenta regresiva al próximo GP, circuitos dibujados en SVG, búsqueda y filtros guardados en la URL |
| **Detalle de carrera** `/race/:round` | Horario del fin de semana en tu zona horaria, circuito animado y podio de la edición anterior |
| **Telemetría** `/telemetry` | Comparación de dos pilotos con datos reales: velocidad de su vuelta más rápida, neumáticos y ventanas de parada |
| **Strategy Lab** `/strategy-lab` | Formulario validado que calcula degradación, ventana de parada y compara tu plan con las mejores alternativas |

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Zustand · React Hook Form · Zod · Framer Motion · Recharts · Vitest

## Decisiones técnicas

- **El estado compartible vive en la URL.** Filtros del calendario y selección de pilotos usan `useSearchParams`, validados con Zod. Zustand queda para el tema persistente.
- **Frontera de datos estricta.** Cada respuesta de las APIs se valida con Zod y se convierte a tipos propios en una capa anticorrupción. Cancelación con `AbortController` y caché de resultados ya resueltos.
- **Motor de estrategia puro y probado.** Fórmula cerrada para el tiempo de cada stint; la ventana de parada sale de una curva de coste convexa; las estrategias alternativas se buscan con recorrido en profundidad, poda y máscara de bits. Un test compara el resultado con una búsqueda exhaustiva.
- **Telemetría alineada.** Las muestras de dos pilotos llegan en instantes distintos: se remuestrean por interpolación lineal sobre una rejilla común. La distancia se aproxima integrando la velocidad.
- **Tema animado con CSS.** Las variables de color se registran con `@property`, así que cambiar de escudería funde el color de toda la interfaz sin JavaScript.
- **Rendimiento.** Carga diferida por ruta, animaciones solo con `transform` y `opacity`, efectos del cursor sin re-renders y `useDeferredValue` para el cálculo pesado.
- **Accesibilidad.** Enlace para saltar al contenido, anuncio de cambios de página, foco visible, controles nativos y soporte de `prefers-reduced-motion`.
- **Contenido 100 % original.** Sin imágenes ni logos de terceros. Los trazados de circuitos se generan con un script a partir de datos de posición de OpenF1.

## Limitaciones

- El simulador usa un **modelo simplificado** (degradación lineal por vuelta, tiempo fijo por parada). Ignora combustible, tráfico y safety car: sirve para comparar estrategias, no para predecir una carrera.
- La distancia del gráfico de telemetría es aproximada.
- Los datos dependen de dos APIs públicas gratuitas.

## Ejecutar en local

```bash
npm install
npm run dev
```

| Script | Función |
|---|---|
| `npm test` | Ejecuta los tests |
| `npm run lint` | Revisa el código |
| `npm run build` | Compila para producción |
| `npm run generate:circuits` | Regenera los trazados de circuitos desde OpenF1 (requiere red) |

## Datos y créditos

- Datos de telemetría y sesiones: [OpenF1](https://openf1.org)
- Calendario y resultados: [Jolpica F1](https://github.com/jolpica/jolpica-f1)