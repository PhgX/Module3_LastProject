const mysql = require("mysql");

class Connection {

    static createConnection() {
      let configToMySQL = {
        host: "localhost",
        user: "root",
        password: "nguyenthidung95",
        database: "project3",
        charset: "utf8mb4",
      };
        return mysql.createConnection(configToMySQL);
    }
}

module.exports = Connection;