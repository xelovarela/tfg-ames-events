const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '6061',
  database: 'ames_events'
});

module.exports = pool;