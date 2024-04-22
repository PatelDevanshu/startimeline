const express = require('express');
const cors = require('cors');
const sql = require('mysql');
const fs = require('fs');
let responseUserData = ''


const port = 4001;
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON body


const db = sql.createConnection({
    host: "sql.freedb.tech",
    user: "freedb_devanshu",
    password: "fvA99jb&kfjW!Z5",
    database: "freedb_timeline",
    dateStrings: true,
})
db.connect((err) => {
    if (err) {
        console.log("Error in connection");
        return;
    }
    else {
        console.log("Connected to Database");
    }
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

    return res.json("From backend");

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

//         const query = "SELECT distinct dt_userstimeline.date_entered, dt_userstimeline.latitude,dt_userstimeline.longitude FROM dt_userstimeline,users WHERE users.id=dt_userstimeline.assigned_user_id AND DATE (dt_userstimeline.date_entered)=? and users.id=? ORDER BY dt_userstimeline.date_entered asc "
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
    const userId = req.body;
    let usid = Object.values(userId);
    let uid = usid[0];
    let udate = usid[1];

    const query = "SELECT distinct dt_userstimeline.date_entered, dt_userstimeline.latitude,dt_userstimeline.longitude FROM dt_userstimeline,users WHERE users.id=dt_userstimeline.assigned_user_id AND DATE (dt_userstimeline.date_entered)=? and users.id=? ORDER BY dt_userstimeline.date_entered asc "
    db.query(query, [udate, uid], (error, results) => {
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


