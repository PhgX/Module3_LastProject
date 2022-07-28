const fs = require("fs");
const qs = require("qs");

const Connection = require("../model/connection.js");

class LoginController {
  constructor() {
    this.connection = Connection.createConnection();
    this.orderId = -1;
  }
  LoginControl(req, res) {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      let logindata = qs.parse(data);
      console.log(logindata);
      let stringUserName = logindata.username.toString();
      let userquery = `select * from users where username = '${stringUserName}' and password = '${logindata.password}';`;

      this.connection.query(userquery, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let parseData = qs.parse(data[0]);
          // console.log(parseData);
          if (parseData.username == null) {
            fs.readFile("./views/login/login.html", "utf-8", (err, data) => {
              if (err) {
                console.log(err);
              } else {
                res.writeHead(200, { "Content-Type": "text/html" });

                let text = `<p style="text-align: center; color: white; font-size: 30px">The account does not exist or entered the wrong password</p>`;
                data = data.replace("{here}", text);
                res.write(data);
                return res.end();
              }
            });
          } else {
            let rolequery = `select ur.role_id from users u join userrole ur on u.id = ur.user_id where username = '${stringUserName}' and password = '${logindata.password}';`;
            this.connection.query(rolequery, (err, data) => {
              console.log(parseData);
              if (err) {
                console.log(err);
              } else {
                // ========================================================
                // Set quyền cho tài khoản ...............
                let roleData = qs.parse(data[0]);
                console.log(roleData);
                let userId = parseData.id;
                let role = roleData.role_id;
                if (role === 1) {
                  console.log("Tài khoản Admin");
                  res.writeHead(301, {
                    location: `/admin?id=${userId}`,
                  });
                  return res.end();
                } else if (role === 2) {
                  this.getOrderId(userId, this.saveOrderId, res);
                }
              }
            });
          }
        }
      });
    });
  }
  getOrderId(userId, callback, res) {
    let queryInsertOrder = `insert into orders(user_id,total) values (${userId},0)`;
    this.connection.query(queryInsertOrder, (err, data) => {
      let parse = qs.parse(data);
      let orderId = parse.insertId;
      console.log(orderId);
      this.orderId = orderId;
      callback(userId, orderId, res);
    });
  }
  saveOrderId(userId, orderId, res) {
    console.log("Tài khoản User");
    res.writeHead(301, {
      location: `/user?id=${userId}`,
    });
    return res.end();
  }
}

module.exports = LoginController;
