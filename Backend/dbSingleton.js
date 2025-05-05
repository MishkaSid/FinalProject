//dbSingleton.js 
const mysql = require('mysql');

let connection;

const dbSingleton = {
    /**
     * Establishes and returns a singleton MySQL database connection.
     * If a connection does not already exist, it creates a new one
     * with the specified configuration (host, user, password, database).
     * Handles initial connection errors and listens for connection errors
     * such as 'PROTOCOL_CONNECTION_LOST', resetting the connection state
     * if needed. Always returns the current database connection instance.
     */

    getConnection: () => {
        if (!connection) {
          connection = mysql.createConnection({
            host: 'LAPTOP-NFISVKKU', 
            user: 'root',
            password: 'M1cha3l.',
            database: 'final_project'
          });

            // Connect to the database
            connection.connect((err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    throw err;
                }
                console.log('Connected to MySQL!');
            });

            // Handle connection errors
            connection.on('error', (err) => {
                console.error('Database connection error:', err);
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    connection = null; // Update the connection state
                }
            });
        }

        return connection; // Return the current connection
    },
};

module.exports = dbSingleton;
