/**
 * Este archivo encapsula la medición opcional de métricas web.
 * Solo carga la libreria web-vitals cuándo se le pasa una funcion callback,
 * evitando trabajo extra si la aplicación no necesita esas métricas.
 */
// Se usa importacion dinamica para no cargar las métricas si nadie las consume.
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
