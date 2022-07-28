const fs = require("fs");
const qs = require("qs");
const localStorage = require('local-storage');

const Connection = require("../model/connection.js");
let connection = Connection.createConnection({ multipleStatements: true });

let createRandomString = (stringLength) => {
  stringLength =
    typeof stringLength == "number" && stringLength > 0 ? stringLength : false;
  if (stringLength) {
    let matchingCharacters = "qwertyuiopasdfghjklzxcvbnm1234567890";
    let str = "";
    for (let i = 0; i < matchingCharacters.length; i++) {
      let randomCharacter = matchingCharacters.charAt(
        Math.floor(Math.random() * matchingCharacters.length)
      );
      str += randomCharacter;
    }
    return str;
  }
};

let createTokenSession = function (data) {
  let tokenID =  createRandomString(30);
  let fileName = "./token/" + tokenID;
  fs.writeFile(fileName, data, (err)=>{
    if(err){
      console.log(err);
    }
  });
};

function LoginControl(req, res) {
  let data = "";
  req.on("data", (chunk) => (data += chunk));
  req.on("end", () => {
    let logindata = qs.parse(data);
    console.log(logindata);
    let stringUserName = logindata.username.toString();
    let userquery = `select * from users where username = '${stringUserName}' and password = '${logindata.password}';`;

    req.on("error", () => {
      console.log("error");
    });

    connection.query(userquery, (err, data) => {
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

              let text = `<p style="text-align: center; color: white; font-size: 30px">Tài khoản không tồn tại hoặc nhập sai mật khẩu</p>`;
              data = data.replace("{here}", text);
              res.write(data);
              return res.end();
            }
          });
        } else {
          let rolequery = `select ur.role_id from users u join userrole ur on u.id = ur.user_id where username = '${stringUserName}' and password = '${logindata.password}';`;
          connection.query(rolequery, (err, data) => {
            console.log(parseData);
            if (err) {
              console.log(err);
            } else {

              // Tạo token ===============================================
              let expires = Date.now() + 60 * 60 * 1000;
              let tokenSession = "{\"name\":\""+stringUserName+"\",\"password\":\""+logindata.password+"\",\"expires\":"+expires+"}";
                
                  createTokenSession(tokenSession);   
                  localStorage.set('token', tokenSession);

              //==========================================================

              // ========================================================
              // Set quyền cho tài khoản ...............
              let roleData = qs.parse(data[0]);
              console.log(roleData);
              let role = roleData.role_id;
              if (role === 1) {
                console.log("Tài khoản Admin");
                res.writeHead(301, {
                  location: "/admin",
                });
                return res.end();
              } else if (role === 2) {
                console.log("Tài khoản User");
                res.writeHead(301, {
                  location: "/user",
                });
                return res.end();
              }
            }
          });
        }
      }
    });
  });
}

module.exports.LoginControl = LoginControl;
