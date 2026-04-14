/**
 * Este archivo centraliza la conexion a MySQL.
 * Exporta un pool de conexiones reutilizable para que los servicios puedan ejecutar
 * consultas sin tener que abrir una conexion nueva en cada operacion.
 */
﻿const mysql = require('mysql2/promise');

// El pool reutiliza conexiones y toma su configuracion desde variables de entorno.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ames_events',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
});

// Se exporta una unica instancia para compartirla en toda la capa de acceso a datos.
module.exports = pool;