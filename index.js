const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname));
app.use(cors());

// MySQL connection pool
const pool = mysql.createPool({
    host: 'sql7.freemysqlhosting.net',
    user: 'sql7708666',
    password: 'EAmQSrtC8N', // Replace with your vPanel password
    database: 'sql7708666',
    port: "3306",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
const createTableQuery = `
CREATE TABLE IF NOT EXISTS selection_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    previous_country VARCHAR(255) NOT NULL,
    new_country VARCHAR(255) NOT NULL,
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

pool.query(createTableQuery, (err, results) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table ensured in database.');
    }
});

app.post('/logChange', (req, res) => {
    const { username, previousCountry, newCountry } = req.body;
    console.log('Received logChange request:', { username, previousCountry, newCountry });

    // Check if username is provided
    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    const insertQuery = `
    INSERT INTO selection_changes (username, previous_country, new_country)
    VALUES (?, ?, ?)
    `;

    pool.query(insertQuery, [username, previousCountry, newCountry], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Error inserting data', message: err.message });
        } else {
            console.log('Data inserted successfully:', results);
            return res.sendStatus(200);
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
