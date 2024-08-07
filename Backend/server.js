const express = require('express');
const cors = require('cors');
const sql = require('mysql');
const fs = require('fs');
let responseUserData = ''

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON body
// process.env.DB_HOST = 'localhost';
// process.env.DB_USER = 'root';
// process.env.DB_PASSWORD = '';
// process.env.DB_DATABASE = 'timeline';

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbDatabase = process.env.DB_DATABASE || 'timeline';
const port = process.env.DB_PORT || 4001;
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
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(); // Reconnect when the connection is lost
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

app.get("/users", (req, res) => {
    return res.json(responseUserData);
});
app.listen(port, () => {
    console.log("on port ", port)
})