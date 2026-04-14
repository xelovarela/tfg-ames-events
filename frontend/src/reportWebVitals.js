/**
 * Este archivo encapsula la medicion opcional de metricas web.
 * Solo carga la libreria web-vitals cuando se le pasa una funcion callback,
 * evitando trabajo extra si la aplicacion no necesita esas metricas.
 */
// Se usa importacion dinamica para no cargar las metricas si nadie las consume.
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
