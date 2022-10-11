const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const ejs = require('ejs');
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

function getSession(callback) {
    let db = new sqlite3.Database('./db/sessions.db', (err) => { });
    let sessions = [];
    db.serialize(() => {
        let sql = `SELECT * FROM session`;
        db.each(sql, (err, row) => {
            if (err) {
                throw err;
                console.log(err)
            }
            console.log(row)
            sessions.push(row.sName)
        },
            function () { // calling function when all rows have been pulled
                db.close(); //closing connection
                callback(sessions);
            }
        );
    });
}


// import classess from "./classess"

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


// test data
let classes = ['Nursery', 'Prep', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
// let sessions = ["2021-2024"]
let students = ["hamza", "ahsan", "abdullah"]

app.get('/', function (req, res) {
    getSession(function (sessions) {
        res.render('home', { sessions });
    })

});


app.get('/login', function (req, res) {
    res.send("Login")
})
app.get("/sessions/add_session", function (req, res) {
    res.render('add_session')
})
app.get("/sessions/:id", function (req, res) {
    // console.log(req.params.id + "  " + sessions + "  " + sessions.includes(req.params.id))
    getSession(function (sessions) {
        if (sessions.includes(req.params.id)) {
            res.render("session", { session: req.params.id, classes: classes })
        }
        else {
            res.send("session not found")
        }
    })
})
app.get("/sessions/:id/add-student", function (req, res) {
    res.render("add_student", { session: req.params.id, classes })
})

app.post("/sessions/add-session", function (req, res) {
    let sessionName = req.body.from + '-' + req.body.to;

    let db = new sqlite3.Database(`./db/${sessionName}.db`, (err) => { });
    for (let i = 0; i < classes.length; i++) {
        db.run(`CREATE TABLE fee_${classes[i].toLowerCase()} (feeId text, fee int, fine int, sFund int)`, () => { });
    }
    for (let i = 0; i < classes.length; i++) {
        if (isNaN(classes[i])) {
            console.log(classes[i])
            db.run(`Create Table ${classes[i].toLowerCase()} (adNo int, sName text, fName text, mar text, apr text, may text, jun text, jul text, aug text, sep text, oct text, nov text, dec text, jan text, feb text)`, () => { })
        }
        else
            db.run(`Create Table ${"class" + "_" + classes[i].toLowerCase()} (adNo int, sName text, fName text, mar text, apr text, may text, jun text, jul text, aug text, sep text, oct text, nov text, dec text, jan text, feb text)`, () => { })
    }


    db = new sqlite3.Database(`./db/sessions.db`, (err) => { });
    console.log(sessionName)
    db.run(`INSERT INTO session (sName) VALUES(?)`, sessionName);

    res.redirect("/")
})

app.post("/sessions/:id/add-student", function (req, res) {
    console.log(req.body)
    let Name = req.body.name;
    let FName = req.body.fname;
    let adNo = req.body.add_no;
    let clas = req.body.class.toLowerCase();
    let session = req.params.id;

    let db = new sqlite3.Database(`./db/${session}.db`, sqlite3.OPEN_READWRITE, function (err) {
        if (err) {
            res.send("Session doesn't exist")
            throw err;
        }
        else {
            if (isNaN(clas))
                db.run(`INSERT INTO ${clas} (sName, fName, adNo) VALUES(?, ?, ?);`, Name, FName, adNo);
            else
                db.run(`INSERT INTO ${"class_" + clas} (sName, fName, adNo) VALUES(?, ?, ?);`, Name, FName, adNo);
            res.redirect("/sessions/" + session)
        }
    })



    //create db and tables in it
    //add session to sessions tabel
})

app.get("/sessions/:id/classes/:clas/submit-fee", function (req, res) {
    let clas = req.params.clas;

    let session = req.params.id;

    clas = isNaN(clas) ? clas : "class_" + clas;


    db = new sqlite3.Database(`./db/${session}.db`, (err) => { });
    let stdNames = []
    let months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    db.all(`SELECT * From ${clas}`, (err2, rows) => {
        for (let i = 0; i < rows.length; i++) {
            stdNames.push(rows[i].sName)
        }
        // res.send(stdNames)
        res.render("submit_fee", { session: req.params.id, clas: req.params.clas, studentList: stdNames, months })
    })



});

app.post("/sessions/:id/classes/:clas/submit-fee", function (req, res) {
    let clas = req.params.clas;
    let clas2 = req.params.clas.toLowerCase();
    let session = req.params.id;
    let month = req.body.month.toLowerCase();
    let fee = [req.body.fee, req.body.fine, req.body.student_fund];

    //inserting into fee

    clas = (isNaN(clas)) ? clas : "class_" + clas;
    if ("student" in req.body) {
        let feeId = crypto.randomBytes(10).toString('hex');
        let db = new sqlite3.Database(`./db/${session}.db`, (err) => { });
        db.run(`update ${clas} SET  (${month})=? where sName = ? COLLATE NOCASE`, feeId, req.body.student)
        db.run(`insert into fee_${clas2} (feeId, fee, fine, sFund) VALUES (?, ?, ?, ?)`, feeId, fee[0], fee[1], fee[2]);
        res.send("sended")
    } else {
        res.send("Student doest not provided")
    }
})

app.get("/sessions/:id/classes/:clas", function (req, res) {
    let clas = req.params.clas;
    let clas2 = req.params.clas;
    let session = req.params.id;

    let allStd = [];
    //use db to get data and check its type
    let db = new sqlite3.Database(`./db/${session}.db`, sqlite3.OPEN_READWRITE, function (err) {
        if (err) {
            res.send("Session doesn't exist")
            throw err;
        }
        else {
            if (!isNaN(clas))
                clas = "class_" + clas;


            db.all(`SELECT * From ${clas}`, (err, rows) => {
                if (err) {
                    console.log(err);
                    res.send("Error's here");
                } else {

                    let grandSum = 0;
                    let monthSum = [];

                    for (let i = 0; i < 12; i++)
                        monthSum.push(0)

                    let std = [];
                    let stdSum = 0;

                    for (let i = 0; i < rows.length; i++) {
                        std = Object.values(rows[i])
                        allStd.push(std)
                    }


                    db.all(`SELECT * From fee_${clas2}`, (err2, FEE) => {
                        if (err2) {
                            console.log(err2);
                            throw err2;
                        }
                        else {
                            let feeIds = [];
                            for (let i = 0; i < FEE.length; i++) {
                                feeIds.push(Object.values(FEE[i]))
                            }

                            for (let i = 0; i < allStd.length; i++) {
                                for (let j = 3; j < 15; j++) {
                                    if (allStd[i][j] !== null) {
                                        for (let k = 0; k < feeIds.length; k++) {
                                            if (allStd[i][j] === feeIds[k][0]) {
                                                allStd[i][j] = feeIds[k].slice(1)
                                                stdSum += feeIds[k].slice(1).reduce((partialSum, a) => partialSum + a, 0)
                                                monthSum[j - 3] += feeIds[k].slice(1).reduce((partialSum, a) => partialSum + a, 0);
                                            }
                                        }
                                    }
                                }
                                allStd[i].push(stdSum)
                                stdSum = 0;
                            }
                            grandSum = monthSum.reduce((partialSum, a) => partialSum + a, 0);
                            console.log(allStd)
                            console.log(monthSum)
                            console.log(grandSum)
                            res.render("class", { session: req.params.id, clas: req.params.clas, allStd, monthSum, grandSum })

                        }
                    })
                }
            });
        }
    })
})
app.listen(5000);
