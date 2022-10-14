const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');

//configuring passport for authentication
app.use(session({
    secret: 'fuwhiebf hweewbnfi',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'session.db', dir: path.join(__dirname, '/db') })
}));
app.use(passport.authenticate('session'));
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
passport.use(new LocalStrategy(function (username, password, done) {
    db2.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
        if (err) { return done(err); }
        if (!row) { return done(null, false, { message: 'Incorrect username or password.' }); }
        if (row.password !== password) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }
        return done(null, row);

    });
}))

//db for login db
let db2 = new sqlite3.Database(path.join(__dirname, `/db/data.db`), (err) => { });



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// test data
let classes = ['Nursery', 'Prep', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']


app.get('/login', function (req, res) {
    if (!req.isAuthenticated()) {
        res.render("login")
    } else {
        res.redirect('/')
    }
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        getSession(function (sessions) {
            res.render('home', { sessions });
        })
    }
    else {
        res.redirect('/login')
    }
});

app.get("/sessions/add_session", function (req, res) {
    if (req.isAuthenticated()) {
        res.render('add_session')
    }
    else {
        res.redirect('/login')
    }
});

app.get("/sessions/:id", function (req, res) {
    // console.log(req.params.id + "  " + sessions + "  " + sessions.includes(req.params.id))
    if (req.isAuthenticated()) {
        getSession(function (sessions) {
            if (sessions.includes(req.params.id)) {
                res.render("session", { session: req.params.id, classes: classes })
            }
            else {
                res.render('error', {error: "Session doesn't exist"})
            }
        })
    }
    else {
        res.redirect('/login')
    }
})
app.get("/sessions/:id/add-student", function (req, res) {

    if (req.isAuthenticated()) {
        res.render("add_student", { session: req.params.id, classes })
    }
    else {
        res.redirect('/login')
    }
})

app.post("/sessions/add-session", function (req, res) {

    if (req.isAuthenticated()) {
        let sessionName = req.body.from + '-' + req.body.to;
        let db = new sqlite3.Database(path.join(__dirname, `/db/${sessionName}.db`), (err) => { });
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
        db = new sqlite3.Database(path.join(__dirname, `/db/sessions.db`), (err) => { });
        console.log(sessionName)
        db.run(`INSERT INTO session (sName) VALUES(?)`, sessionName);
        res.redirect("/")
        db.close();
    }
    else {
        res.redirect('/login')
    }

})

app.post("/sessions/:id/add-student", function (req, res) {
    if (req.isAuthenticated()) {
        let Name = req.body.name;
        let FName = req.body.fname;
        let adNo = req.body.add_no;
        let clas = req.body.class.toLowerCase();
        let session = req.params.id;

        let db = new sqlite3.Database(path.join(__dirname, `/db/${session}.db`), sqlite3.OPEN_READWRITE, function (err) {
            if (err) {
                res.render('error', {error: "Session doesn't exist"})
            }
            else {
                if (isNaN(clas))
                    db.run(`INSERT INTO ${clas} (sName, fName, adNo) VALUES(?, ?, ?);`, Name, FName, adNo);
                else
                    db.run(`INSERT INTO ${"class_" + clas} (sName, fName, adNo) VALUES(?, ?, ?);`, Name, FName, adNo);
                res.redirect("/sessions/" + session)
            }
        })
        db.close();
    }
    else {
        res.redirect('/login')
    }
})

app.get("/sessions/:id/classes/:clas/submit-fee", function (req, res) {
    if (req.isAuthenticated()) {
        let clas = req.params.clas;

        let session = req.params.id;

        clas = isNaN(clas) ? clas : "class_" + clas;


        db = new sqlite3.Database(path.join(__dirname, `/db/${session}.db`), (err) => { });
        let stdNames = []
        let months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
        db.all(`SELECT * From ${clas}`, (err2, rows) => {
            for (let i = 0; i < rows.length; i++) {
                stdNames.push(rows[i].sName)
            }
            // res.send(stdNames)
            res.render("submit_fee", { session: req.params.id, clas: req.params.clas, studentList: stdNames, months })
        })
        db.close();
    } else {
        res.redirect('/login')
    }
});

app.post("/sessions/:id/classes/:clas/submit-fee", function (req, res) {
    if (req.isAuthenticated()) {
        let clas = req.params.clas;
        let clas2 = req.params.clas.toLowerCase();
        let session = req.params.id;
        let month = req.body.month.toLowerCase();
        let fee = [req.body.fee, req.body.fine, req.body.student_fund];

        //inserting into fee

        clas = (isNaN(clas)) ? clas : "class_" + clas;
        if ("student" in req.body) {
            let feeId = crypto.randomBytes(10).toString('hex');
            let db = new sqlite3.Database(path.join(__dirname, `/db/${session}.db`), (err) => { });
            db.run(`update ${clas} SET  (${month})=? where sName = ? COLLATE NOCASE`, feeId, req.body.student)
            db.run(`insert into fee_${clas2} (feeId, fee, fine, sFund) VALUES (?, ?, ?, ?)`, feeId, fee[0], fee[1], fee[2]);
            res.send("sended")
        } else {
            res.render('error', {error: "No students is availble in class"})
        }
        db.close();
    }
    else {
        res.redirect('/login')
    }

})

app.get("/sessions/:id/classes/:clas", function (req, res) {
    if (req.isAuthenticated()) {
        let clas = req.params.clas;
        let clas2 = req.params.clas;
        let session = req.params.id;

        let allStd = [];
        //use db to get data and check its type
        let db = new sqlite3.Database(path.join(__dirname, `/db/${session}.db`), sqlite3.OPEN_READWRITE, function (err) {
            if (err) {
                res.render('error', {error: "Class doesn't exist"})
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
                                res.render("class", { session: req.params.id, clas: req.params.clas, allStd, monthSum, grandSum })
                            }
                        })
                    }
                });
            }
        })
        db.close();
    }
    else 
    {
        res.redirect('/login')
    }
})


app.get("/change-pass", function (req, res) {
    if (req.isAuthenticated()) {
        res.render('changePass')
    }
    else {
        res.redirect('/login')
    }
});

app.post('/change-pass', function(req, res) {
    let all = req.body;
    console.log(all);
    let db = new sqlite3.Database(path.join(__dirname, `/db/data.db`), (err) => { });
    db.get('SELECT * FROM users WHERE password=?', [all.current_pass], function (err, row) {
        if (err || !row){
            res.send("Error Occured")
        }else if (all.new_pass !== all.a_new_pass) {
            res.send("Passwords doesnt match")
        }
        else{
            db.run("UPDATE users SET password = ? where password = ?",all.new_pass, all.current_pass)
            res.redirect("/")
            db.close();
        }
    })
})


// currently working
app.get('/sessions/delete/:id', function(req, res) {
    if (req.isAuthenticated()) {
        let session = req.params.id;
        console.log(session);

    //remove session from sessions.db
    let db = new sqlite3.Database(path.join(__dirname, `/db/sessions.db`), (err) => { });
        db.get('SELECT * FROM session WHERE sName=?', [session], function (err, row) {
            if (err ||!row){
                console.log(err);
                res.render('error', { error: "Could not Deleted"});
            }
            else{
                db.run("DELETE FROM session WHERE sName=?", [session])
                db.close();
                //remove db file from db folder
                fs.unlink(path.join(__dirname, `/db/${session}.db`), (err) => { })
                res.redirect('/');    
            }
            
        })
    } 
    else
    res.redirect('/login')
})

app.listen(process.env.PORT || 5000);


function getSession(callback) {
    let db = new sqlite3.Database(path.join(__dirname, '/db/sessions.db'), (err) => { });
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