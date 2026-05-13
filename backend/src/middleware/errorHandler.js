const errorHandler = (err, req, res, next) => {
  // Por defecto, asumimos un error interno del servidor
  const statusCode = err.statusCode || 500;
  
  // Registramos el error completo en el backend (útil para desarrollo/logs)
  console.error(`[Error Global] ${req.method} ${req.url}:`, err);

  // Ocultamos el mensaje real si es un error 500 para no filtrar detalles técnicos (como queries de DB)
  const message = statusCode === 500 
    ? 'Error interno del servidor.' 
    : err.message;

  res.status(statusCode).json({
    error: message
  });
};

module.exports = errorHandler;
