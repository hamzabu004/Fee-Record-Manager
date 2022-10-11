exports.getPlayerData = function(players,msg,mention = false, callback){
    var db = new sqlite3.Database('data/levels/' + msg.guild.id + '.db');
    var data = []; //for storing the rows.
    db.serialize(function() {
        var stmt = "CREATE TABLE if not exists uid_" + member.id  + " (id INTEGER PRIMARY KEY, username TEXT, avatarID TEXT, avatarURL TEXT, xp INTEGER, level INTEGER, lastXp INTEGER)";
        db.run(stmt);

        db.run("INSERT OR IGNORE INTO uid_" + member.id  + " (id,username,avatarURL,xp,level,lastXP) VALUES (?,?,?,?,?,?)", member.id,member.username, member.avatarURL , 0, 0, 0);

        db.each("SELECT * FROM uid_" + member.id + " WHERE id = " + member.id , function(err, row) {
            data.push(row); //pushing rows into array
        }, function(){ // calling function when all rows have been pulled
            db.close(); //closing connection
            callback(data); 
        });
    });
}