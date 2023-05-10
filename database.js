const mysql = require('mysql2');

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'shareameal',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0
});


pool.getConnection(function(err, conn) {
    if (err) {
        console.log('Errors:', err);
    }
    if (conn) {
        conn.query('SELECT `id`, `name` FROM `meal`',
        function(err, results, fields) {
          if (err) {
              console.log(err.sqlMessage, ' ', err.errno, ' ', err.code, ' ');
          }
          console.log('Errors: ', err);
          console.log('Results: ', results);
          //console.log('Fields: ', fields);
        })
        pool.releaseConnection(conn);
    }
 })

