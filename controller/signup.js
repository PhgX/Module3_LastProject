const fs = require("fs");
const qs = require("qs");
const Connection = require("../model/connection.js");

let connection = Connection.createConnection();

function SignUpAccount(req, res) {
  let data = "";
  req.on("data", (chunk) => (data += chunk));
  req.on("end", () => {
    let accountinfo = qs.parse(data);

    // Hàm check password (ít nhất 1 ký tự thường, 1 ký tự viết hoa, 1 ký tự đặc biệt, dài từ 6 đến 20 ký tự)
    let ValidatePassword = (password, repassword) => {
      let regExPassword = new RegExp(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,20}$/
      );
      if (password.match(regExPassword) && password === repassword) {
        return true;
      } else {
        return false;
      }
    };

    // Hàm check email
    const ValidateEmail = (email) => {
      let emailRegex =
        /^(([^<>()[\]\\.,;:!#$%^&*()\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (email.match(emailRegex)) {
        return true;
      } else {
        return false;
      }
    };

    const ValidatePhone = (phone) => {
      if (isNaN(phone) === false || phone.split("").length <= 10) {
        return true;
      } else {
        return false;
      }
    };

    // Check validate toàn bộ form để push vào database
    if (
      ValidatePassword(accountinfo.password, accountinfo.re_password) &&
      ValidateEmail(accountinfo.email) &&
      ValidatePhone(accountinfo.phone)
    ) {
      let insertQuery = `insert into users(username, password, email, name, phone, address) values('${accountinfo.username}', '${accountinfo.password}', '${accountinfo.email}', '${accountinfo.name}', '${accountinfo.phone}', '${accountinfo.address}');`;
      connection.query(insertQuery, (err, data) => {
        if (err) {
          // console.log(err);
          let userNameQuery = `select id from users where username = '${accountinfo.username}';`;
          let emailQuery = `select id from users where email = '${accountinfo.email}';`;
          let phoneQuery = `select id from users where email = '${accountinfo.phone}';`;
          connection.query(userNameQuery, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let checkresult = qs.parse(data[0]);
              let id = checkresult.id;
              console.log(checkresult);
              if (id) {
                fs.readFile(
                  "./views/login/SignUpAccount.html",
                  "utf-8",
                  (err, data) => {
                    if (err) {
                      console.log(err);
                    } else {
                      res.writeHead(200, { "Content-Type": "text/html" });
                      res.write(data);
                      res.write("Account already exists");
                      return res.end();
                    }
                  }
                );
              }
            }
          });
          connection.query(emailQuery, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let checkresult = qs.parse(data[0]);
              let id = checkresult.id;
              console.log(checkresult);
              if (id) {
                fs.readFile(
                  "./views/login/SignUpAccount.html",
                  "utf-8",
                  (err, data) => {
                    if (err) {
                      console.log(err);
                    } else {
                      res.writeHead(200, { "Content-Type": "text/html" });
                      res.write(data);
                      res.write("The Email was registered");
                      return res.end();
                    }
                  }
                );
              }
            }
          });
          connection.query(phoneQuery, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let checkresult = qs.parse(data[0]);
              let id = checkresult.id;
              console.log(checkresult);
              if (id) {
                fs.readFile(
                  "./views/login/SignUpAccount.html",
                  "utf-8",
                  (err, data) => {
                    if (err) {
                      console.log(err);
                    } else {
                      res.writeHead(200, { "Content-Type": "text/html" });
                      res.write(data);
                      res.write("Registered phone number");
                      return res.end();
                    }
                  }
                );
              }
            }
          });
        } else {  
          // Tạo role cho tài khoản mới===============================        
          let newUserID;
          let userquery1 = `select id from users where username = '${accountinfo.username}'`;
          connection.query(userquery1, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let parsedata = qs.parse(data[0]);
              console.log(parsedata);
              newUserID = parsedata.id;             
            }
          });
          setTimeout(() => {
            let roleUser = 2;
            let userquery2 = `insert into userrole(role_id,user_id) values (${roleUser},${newUserID});`;
            connection.query(userquery2, (err, data) => {
              if (err) {
                console.log(err);
              }             
            });
          }, 100);
          //=============================================================
          //=============================================================
          fs.readFile(
            "./views/login/SignUpAccount.html",
            "utf-8",
            (err, data) => {
              if (err) {
                console.log(err);
              } else {
                let success = `<p style="text-align: center; color: white; font-size: 30px">Account created successfully</p>`;
                data = data.replace("{here}", success);
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(data);
                return res.end();
              }
            }
          );
        }
      });
    } else if (accountinfo.password != accountinfo.re_password) {
      fs.readFile("./views/login/SignUpAccount.html", "utf-8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let success1 = `<p style="text-align: center; color: white; font-size: 30px">Error! Confirmation password is incorrect</p>`;
          data = data.replace("{here}", success1);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          return res.end();
        }
      });
    } else if (
      ValidatePassword(accountinfo.password, accountinfo.re_password) === false
    ) {
      fs.readFile("./views/login/SignUpAccount.html", "utf-8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let success2 =
            `<p style="text-align: center; color: white; font-size: 30px">Error! The password entered is not correct\n` +
            `Passwords should be between 6 and 20 characters long, with at least 1 lowercase letter, 1 uppercase letter, and 1 special character.</p>`;
          data = data.replace("{here}", success2);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          return res.end();
        }
      });
    } else if (ValidateEmail(accountinfo.email) === false) {
      fs.readFile("./views/login/SignUpAccount.html", "utf-8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let success3 = `<p style="text-align: center; color: white; font-size: 30px">Error!! Email entered incorrectly</p>`;
          data = data.replace("{here}", success3);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          return res.end();
        }
      });
    } else if (ValidatePhone(accountinfo.phone)) {
      fs.readFile("./views/login/SignUpAccount.html", "utf-8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let success4 = `<p style="text-align: center; color: white; font-size: 30px">Error!! Incorrect phone number</p>`;
          data = data.replace("{here}", success4);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          return res.end();
        }
      });
    }
  });
}

module.exports.SignUpAccount = SignUpAccount;
