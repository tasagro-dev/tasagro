# Plan para corregir la búsqueda de comparables

## Objetivo
Eliminar el error 500 al hacer clic en **“Buscar comparables en MercadoLibre”** y lograr que la tasación devuelva resultados válidos o una respuesta controlada cuando MercadoLibre no permita una búsqueda.

## Qué voy a hacer

1. **Rehacer la estrategia de búsqueda en el backend**
   - Reemplazar la URL actual que usa `q`, `state` y `TOTAL_AREA`, porque esa combinación está devolviendo 403 desde MercadoLibre.
   - Adaptar la búsqueda al formato documentado para inmuebles, priorizando ubicación válida y filtros compatibles.
   - Mantener el token OAuth solo para lo que sí lo necesita, no para forzar la búsqueda principal.

2. **Agregar tolerancia a fallos en la función**
   - Si MercadoLibre rechaza una variante de búsqueda, probar una alternativa compatible en vez de terminar directamente en 500.
   - Cuando no haya resultados o la API limite la consulta, devolver una respuesta estructurada vacía o degradada, no una excepción genérica.
   - Mejorar los logs para distinguir entre: credenciales, endpoint rechazado, sin resultados, y error externo.

3. **Mejorar el manejo del error en frontend**
   - Leer mejor la respuesta de la función para mostrar un mensaje útil en vez del error técnico genérico.
   - Mantener el modal y flujo de tasación funcionando aunque la búsqueda externa falle.

4. **Validar extremo a extremo**
   - Probar la función con el mismo caso que hoy falla (`Córdoba / Calamuchita / 9 ha / ganadero`).
   - Confirmar que ya no responda 500.
   - Verificar que la UI muestre resultados o un estado vacío controlado.

## Hallazgo clave
- Las credenciales de MercadoLibre **sí existen** y el token OAuth se obtiene correctamente.
- El rechazo ocurre en la llamada de búsqueda misma, por eso el problema real está en **cómo se construye el request** y en que hoy ese fallo se propaga como 500.

## Detalle técnico
- Archivo principal: `supabase/functions/mercadolibre-comparables/index.ts`
- Punto de invocación: `src/pages/NuevaTasacion.tsx`
- Ajustes esperados:
  - reconstrucción de `buildSearchUrl`
  - estrategia de fallback de búsqueda
  - mejor normalización de respuesta/error
  - manejo de error más claro en el cliente