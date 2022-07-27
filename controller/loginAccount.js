const fs = require("fs");
const qs = require("qs");

const Connection = require("../model/connection.js");

let connection = Connection.createConnection({multipleStatements: true});

function LoginControl(req, res) {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      let logindata = qs.parse(data);     
      let stringUserName = logindata.username.toString();
      let userquery = `select * from users where username = '${stringUserName}' and password = '${logindata.password}';`;
  
      connection.query(userquery, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log('da vao phan login')
          let parseData = qs.parse(data[0]);
          if (parseData.username == null) {
            fs.readFile(
              "./views/login/login.html",
              "utf-8",
              (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  res.writeHead(200, { "Content-Type": "text/html" });
                  
                  let text = `<p style="text-align: center; color: white; font-size: 30px">Tài khoản không tồn tại hoặc nhập sai mật khẩu</p>`;
                  data = data.replace('{here}', text);
                  res.write(data);
                  return res.end();
                }
              }
            );
          } else {
            let rolequery = `select ur.role_id from users u join userrole ur on u.id = ur.user_id where username = '${stringUserName}' and password = '${logindata.password}';`;
            connection.query(rolequery, (err, data) => {
              if (err) {
                console.log(err);
              } else {
            // ========================================================
            // Set quyền cho tài khoản ...............
                let roleData = qs.parse(data[0]);
                console.log('role =' + roleData);
                let role = roleData.role_id;
                if (role === 1) {
                  console.log('Tài khoản Admin');

                } else if (role === 2) {
                  console.log('Tài khoản User');
                  
                }
              }
            });
            // ========================================================
            fs.readFile(
              "./views/login/loginsuccess.html",
              "utf-8",
              (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  res.writeHead(200, { "Content-Type": "text/html" });
                  res.write(data);
                  return res.end();
                }
              }
            );
          }
  
        }
      });
    });
  }

  module.exports.LoginControl = LoginControl;