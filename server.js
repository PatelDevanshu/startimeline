const express = require('express');
const cors = require('cors');
const sql = require('mysql');
const fs = require('fs');
let responseUserData = ''

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON body

const dbHost = process.env.DB_HOST || '';
const dbUser = process.env.DB_USER || '';
const dbPassword = process.env.DB_PASSWORD || '';
const dbDatabase = process.env.DB_DATABASE || '';
const port = process.env.DB_PORT || 4001;
const API_KEY = process.env.API_KEY || '';
console.log("port", port);
console.log("dbDatabase", dbDatabase);

// const db = sql.createConnection({
//     host: dbHost,
//     user: dbUser,
//     password: dbPassword,
//     database: dbDatabase,
//     dateStrings: true
// })
// db.connect((err) => {
//     if (err) {
//         console.log("Error in connection");
//         return;
//     }
//     else {
//         console.log("Connected to Database");
//     }
// });

function handleDisconnect() {
    const db = sql.createConnection({
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        database: dbDatabase,
        dateStrings: true
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to database:', err);
            setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
        } else {
            console.log('Connected to Database');
        }
    });

    db.on('error', (err) => {
        console.error('Database error:', err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            setTimeout(handleDisconnect, 2000); // Reconnect when the connection is lost
        } else {
            throw err;
        }
    });

    return db;
}

const db = handleDisconnect();

app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    let isAuthenticated = false;
    let user = "Unauthorized";
    if (username === "admin" && password === "admin123") {
        isAuthenticated = true;
        user = "admin";
    } else {
        isAuthenticated = false;
        user = "Unauthorized";
    }
    let userdata = { isAuthenticated, user };
    res.json(userdata);
})

app.get("/users/useriddata", (req, res) => {
    // const q = "SELECT * FROM usertimeline";
    const q = "SELECT id,user_name from users";
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        // console.log(data);
        res.json(data);
    })
})

app.get('/', (req, res) => {

    return res.json(`From backend and port: ${port}`);

})

// app.all("/users/userData", (req, res) => {
//     if (req.method === "POST") {
//         const userId = req.body;
//         console.log("usid : ", userId);
//         let usid = Object.values(userId);
//         let uid = usid[0];
//         let udate = usid[1];
//         console.log("usid", uid);
//         console.log("usid", udate);

//         const query = "SELECT distinct dt_userstimeline1.date_entered, dt_userstimeline1.latitude,dt_userstimeline1.longitude FROM dt_userstimeline1,users WHERE users.id=dt_userstimeline1.assigned_user_id AND DATE (dt_userstimeline1.date_entered)=? and users.id=? ORDER BY dt_userstimeline1.date_entered asc "
//         db.query(query, [udate, uid], (error, results) => {
//             if (error) {
//                 console.error('Error fetching user data:', error);
//                 res.status(500).json({ error: 'Failed to fetch user data' });
//                 return;
//             }
//             userData = results;
//             responseUserData = results
//             fs.writeFile('userdata.json', JSON.stringify(userData, null, 2), err => {
//                 if (err) {
//                     console.error('Error storing user data:', err);
//                 } else {
//                     console.log('User data stored successfully');
//                 }
//             });
//             res.json(results);
//         });

//     }
//     else if (req.method === "GET") {
//         if (userData === '') {
//             res.json("emoty")
//         }
//         else {
//             res.json("results : ", userData);

//         }
//     }
// });
app.post("/users/userData", (req, res) => {
    const { props1, dateFormat } = req.body;

    let id = props1;
    let date = dateFormat;

    const query = "SELECT distinct dt_userstimeline1.date_entered, dt_userstimeline1.latitude,dt_userstimeline1.longitude FROM dt_userstimeline1,users WHERE users.id=dt_userstimeline1.assigned_user_id AND DATE (dt_userstimeline1.date_entered)=? and users.id=? ORDER BY dt_userstimeline1.date_entered asc "
    db.query(query, [date, id], (error, results) => {
        if (error) {
            console.error('Error fetching user data:', error);
            res.status(500).json({ error: 'Failed to fetch user data' });
            return;
        }
        userData = results;
        responseUserData = results
        fs.writeFile('userdata.json', JSON.stringify(userData, null, 2), err => {
            if (err) {
                console.error('Error storing user data:', err);
            } else {
                console.log('User data stored successfully');
            }
        });
        res.json(results);
    })
})

app.post("/users/addData", (req, res) => {
    const { lng, lat, date, assigned_id, name } = req.body;

    const query = `
        INSERT INTO \`dt_userstimeline1\` (\`name\`, \`date_entered\`, \`date_modified\`, \`assigned_user_id\`, \`longitude\`, \`latitude\`, \`locationdatetime\`)
        VALUES ('${name}', '${date}', '${date}', ${assigned_id}, '${lng}', '${lat}', '${date}');
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error to insert data:', error);
            res.status(500).json({ error: 'Failed to insert user data' });
            return;
        }
        else {
            if (results) {
                res.json("Data inserted successfully");
            }
            else {
                res.json("Error inserting..");
            }
            return;
        }
    })
})

// Define your API endpoint
app.get('/api/filterdata', (req, res) => {
    // Read userdata.json file
    fs.readFile('userdata.json', (err, data) => {
        if (err) {
            console.error('Error reading userdata.json:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        // Parse JSON data and send as response
        const userdata = JSON.parse(data);
        res.json(userdata);
    });
});



// Define geographical bounds for Indian landmass
const INDIA_BOUNDS = {
    lat_min: 8.0,    // Southern boundary
    lat_max: 37.0,   // Northern boundary
    lng_min: 68.0,   // Western boundary
    lng_max: 97.0    // Eastern boundary
};

// Define specific bounds for cities
const CITY_BOUNDS = {
    'Mumbai': {
        lat_min: 18.8,
        lat_max: 19.4,
        lng_min: 72.7,
        lng_max: 73.3
    },
    'Pune': {
        lat_min: 18.4,
        lat_max: 18.8,
        lng_min: 73.7,
        lng_max: 74.1
    },
    'Valsad': {
        lat_min: 20.2,
        lat_max: 20.5,
        lng_min: 72.9,
        lng_max: 73.2
    },
    'Surat': {
        lat_min: 21.1,
        lat_max: 21.5,
        lng_min: 72.7,
        lng_max: 73.1
    },
    'New Delhi': {
        lat_min: 28.4,
        lat_max: 28.9,
        lng_min: 76.8,
        lng_max: 77.3
    },
    'Bangalore': {
        lat_min: 12.8,
        lat_max: 13.2,
        lng_min: 77.5,
        lng_max: 77.8
    },
    'Hyderabad': {
        lat_min: 17.2,
        lat_max: 17.6,
        lng_min: 78.3,
        lng_max: 78.7
    },
    'Chennai': {
        lat_min: 12.9,
        lat_max: 13.2,
        lng_min: 80.2,
        lng_max: 80.4
    }
};

function randomCoordinatesWithinBounds(center_lat, center_lng, radius_km, specific_bounds = null) {
    const radius_in_degrees = radius_km / 111.32; // Convert radius to degrees

    // Generate random angle and distance within the circle
    const angle = Math.random() * 2 * Math.PI; // Random angle
    const distance = Math.sqrt(Math.random()) * radius_in_degrees; // Random distance within the circle

    // Calculate new latitude and longitude
    let lat = center_lat + distance * Math.cos(angle);
    let lng = center_lng + distance * Math.sin(angle);

    // Constrain to specific bounds if provided
    if (specific_bounds) {
        lat = Math.max(Math.min(lat, specific_bounds.lat_max), specific_bounds.lat_min);
        lng = Math.max(Math.min(lng, specific_bounds.lng_max), specific_bounds.lng_min);
    }

    return { lat, lng };
}

// Function to generate random timestamp
function randomTimestamp(start_date) {
    // Set the start time to 8:00 AM
    const start = new Date(start_date).setHours(8, 0, 0, 0);
    // Set the end time to 10:00 PM
    const end = new Date(start_date).setHours(22, 0, 0, 0);

    // Generate a random time between 8:00 AM and 10:00 PM
    const randomTime = new Date(start + Math.random() * (end - start));

    // Return the timestamp as a string to check the exact time generated
    return randomTime;
}

// Function to generate and execute insert queries
async function generateAndInsertData(name, assigned_user_id, city, date) {
    if (!CITY_BOUNDS[city]) {
        throw new Error("City not supported. Please use a valid city.");
    }

    const { lat: center_lat, lng: center_lng } = {
        'Mumbai': { lat: 19.0760, lng: 72.8777 },
        'Pune': { lat: 18.5204, lng: 73.8567 },
        'Valsad': { lat: 20.3682, lng: 73.0720 },
        'Surat': { lat: 21.1702, lng: 72.8311 },
        'New Delhi': { lat: 28.6139, lng: 77.2090 },
        'Bangalore': { lat: 12.9716, lng: 77.5946 },
        'Hyderabad': { lat: 17.3850, lng: 78.4867 },
        'Chennai': { lat: 13.0827, lng: 80.2707 }
    }[city];

    const start_date = new Date(date);

    const inserts = [];

    const bounds = CITY_BOUNDS[city];

    // Generate 10 values within 5km radius
    for (let i = 0; i < 10; i++) {
        const { lat, lng } = randomCoordinatesWithinBounds(center_lat, center_lng, 5, bounds);
        const timestamp = randomTimestamp(start_date);
        inserts.push({
            name,
            date_entered: timestamp,
            date_modified: timestamp,
            assigned_user_id,
            longitude: lng.toFixed(4),
            latitude: lat.toFixed(4),
            locationdatetime: timestamp
        });
    }

    // Generate 5 values within 100km radius
    for (let i = 0; i < 5; i++) {
        const { lat, lng } = randomCoordinatesWithinBounds(center_lat, center_lng, 100, bounds);
        const timestamp = randomTimestamp(start_date);
        inserts.push({
            name,
            date_entered: timestamp,
            date_modified: timestamp,
            assigned_user_id,
            longitude: lng.toFixed(4),
            latitude: lat.toFixed(4),
            locationdatetime: timestamp
        });
    }

    let inserted_id = [];

    // Convert inserts into SQL queries and execute them
    for (const insert of inserts) {
        const sql = `INSERT INTO dt_userstimeline1 (name, date_entered, date_modified, assigned_user_id, longitude, latitude, locationdatetime) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [insert.name, insert.date_entered, insert.date_modified, insert.assigned_user_id, insert.longitude, insert.latitude, insert.locationdatetime];

        try {
            const result = await new Promise((resolve, reject) => {
                db.query(sql, values, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            inserted_id.push(result.insertId);
        } catch (err) {
            console.error('Error executing query:', err);
            throw new Error('Error executing query');
        }
    }

    return {
        'Insert Id': inserted_id,
        'inserted_assigned_id': assigned_user_id,
        'inserted_date': date
    };
}

// Define POST API to make daily entries
app.post('/generate-inserts', async (req, res) => {
    const { name, assigned_id, city, date, apiKey } = req.body;

    try {
        if (apiKey === API_KEY) {
            let response = await generateAndInsertData(name, assigned_id, city, date);
            res.json({ message: 'Data inserted successfully', response });
        }
        else {
            res.status(403).json({ error: 'Forbidden: Invalid API key' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/users", (req, res) => {
    return res.json(responseUserData);
});
app.listen(port, () => {
    console.log("on port ", port)
})