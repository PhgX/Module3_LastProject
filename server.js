const fs = require("fs");
const http = require("http");
const url = require("url");
const qs = require("qs");
const checkRegister = require("./controller/signup");
const Connection = require("./model/connection");
const LoginControl = require('./controller/loginAccount');
const ProductModel = require('./model/ProductModel')

let connection = Connection.createConnection({ multipleStatements: true });
const mimeTypes = {
  html: "text/html",
  js: "text/javascript",
  "min.js": "text/javascript",
  css: "text/css",
  "min.css": "text/css",
  jpg: "image/jpg",
  png: "image/png",
  gif: "image/gif",
  woff: "text/html",
  ttf: "text/html",
  woff2: "text/html",
  eot: "text/html",
};

function getCate() {
  return new Promise((resolve, reject) => {
    let queryListCategories = `select name from categories
      order by id;`;
    connection.query(queryListCategories, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
function getProducts() {
  return new Promise((resolve, reject) => {
    let queryProducts = `select p.name, p.price,p.image, c.name as catename
      from products p join categories c on p.category_id = c.id;`;
    connection.query(queryProducts, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


const server = http.createServer((req, res) => {
  const filesDefences = req.url.match(
    /\.js|.css|.jpg|.png|.gif|min.js|min.css|.woff|.ttf|.woff2|.eot/
  );
  if (filesDefences) {
    let filePath = filesDefences[0].toString();
    let extension = mimeTypes[filesDefences[0].toString().split(".")[1]];
    if (filePath.includes("/css")) {
      extension = mimeTypes[filesDefences[0].toString().split("/")[1]];
    }
    if (extension.includes("?")) {
      extension = extension.split("?")[0];
    }
    res.writeHead(200, { "Content-Type": extension });
    fs.createReadStream(__dirname + "/" + req.url).pipe(res);
  } else {
    let urlParse = url.parse(req.url);
    let pathName = urlParse.pathname;
    switch (pathName) {
      case "/": {
        fs.readFile("./views/home/index.html", "utf-8", async (err, data) => {
          if (err) {
            console.log(err);
          } else {
            let categories = await getCate();
            let products = await getProducts();
            let cateText = "";
            let productText = "";
            for (let i = 0; i < categories.length; i++) {
              let filter = categories[i].name;
              filter = filter.toLowerCase();
              // if (filter.includes(" ")) {
              //   filter = filter.replace(" ","-");
              // }
              cateText += `<li data-filter=".${filter}">${categories[i].name}</li>`;
            }
            for (let i = 0; i < products.length; i++) {
              let filter = products[i].catename;
              filter = filter.toLowerCase();
              productText += `<div class="col-lg-3 col-md-4 col-sm-6 mix ${filter}">
            <div class="featured__item">
                <div class="featured__item__pic set-bg" data-setbg="assets/home/img/featured/feature-1.jpg">
                    <ul class="featured__item__pic__hover">
                    <form action="#">
                    <input type="number"  placeholder="Amount">
                    <button type="submit" class="site-btn">BUY</button>
                    </form>
                    </ul>
                </div>
                <div class="featured__item__text">
                    <h6><a href="#">${products[i].name}</a></h6>
                    <h5>${products[i].price} VND</h5>
                </div>
            </div>
        </div>`;
            }
            data = data.replace("{catelogies}", cateText);
            data = data.replace("{products}", productText);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data);
            return res.end();
          }
        });
        break;
      }
      case "/login": {
        //Data control login site
        if (req.method === "GET") {
          fs.readFile("./views/login/login.html", "utf-8", (err, data) => {
            if (err) {
              console.log(err);
            } else {
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(data);
              return res.end();
            }
          });
        } else {
         LoginControl.LoginControl(req, res);
        }
        break;
      }
      case "/signup": {
        if (req.method === "GET") {
          fs.readFile(
            "./assets/views/login/signup.html",
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
        } else {
          checkRegister.SignUpAccount(req, res);
        }
        break;
      }
      case "/admin": {
          fs.readFile("./views/home/admin.html", "utf-8", async(err, data) => {
            if (err) {
              console.log(err);
            } else {
              let products = await getProducts();
              let tbody = "";
              for (let i = 0; i < products.length; i++) {
                tbody += `<tr>
                <td>${i+1}</td>
                <td>${products[i].name}</td>
                <td>${products[i].price}</td>
                <td>${products[i].catename}</td>
                <td><img src=" ${products[i].image} " width="100px" height="100px"></td>
                <td><a href="/admin/edit?id=${products[i].id}" class="btn btn-primary">Edit</a></td>
                <td><a href="/admin/delete?id=${products[i].id}" class="btn btn-danger">Delete</a></td>
                <td><a href="/admin/create" class="btn btn-warning">Create</a></td>
                </tr>`;     
              }
              data = data.replace("{tbody}", tbody);
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(data);
              return res.end();
            }
          });
          break;
        }
        case "/admin/create": {
          if (req.method === "GET") {
            fs.readFile("./views/home/admin-create.html", "utf-8",  (err, data) => {
              if (err) {
                console.log(err);
              } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(data);
                return res.end();
              }
            });
          } else {
            let data = "";
            req.on("data", chunk => {
              data += chunk;
            });
            req.on ("end", () => {
              let product = qs.parse(data);
              let insertQuery = `insert into products(name,price,discount_id,image,category_id) VALUES ('${product.name}', ${product.price}, ${product.Discount_id}, '${product.Image}',${product.Category_id})`;
              // let form = new formidable.IncomingForm();
              // form.uploadDir = "./views/home/upload";
              // form.parse(req, (err, fields, files) => {
              //   let oldpath = files.image.path;
              //   let newpath = "./views/home/upload/" + files.image.name;
              //   fs.rename(oldpath, newpath, err => {
              //     if (err) throw err;
              //   });
              // });            
              connection.query(insertQuery, (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log('insert success');
                  res.writeHead(302, { Location: "/admin" });
                  res.end();
                }
              });
            }); 
          }
          break;
        }  

      case "/user": {
        fs.readFile("./views/home/user.html", "utf-8", async (err, data) => {
          if (err) {
            console.log(err);
          } else {
            let categories = await getCate();
            let products = await getProducts();
            let cateText = "";
            let productText = "";
            for (let i = 0; i < categories.length; i++) {
              let filter = categories[i].name;
              filter = filter.toLowerCase();
              // if (filter.includes(" ")) {
              //   filter = filter.replace(" ","-");
              // }
              cateText += `<li data-filter=".${filter}">${categories[i].name}</li>`;
            }
            for (let i = 0; i < products.length; i++) {
              let filter = products[i].catename;
              filter = filter.toLowerCase();
              productText += `<div class="col-lg-3 col-md-4 col-sm-6 mix ${filter}">
            <div class="featured__item">
                <div class="featured__item__pic set-bg" data-setbg="assets/home/img/featured/feature-1.jpg">
                    <ul class="featured__item__pic__hover">
                    <form action="#">
                    <input type="number"  placeholder="Amount">
                    <button type="submit" class="site-btn">BUY</button>
                    </form>
                    </ul>
                </div>
                <div class="featured__item__text">
                    <h6><a href="#">${products[i].name}</a></h6>
                    <h5>${products[i].price} VND</h5>
                </div>
            </div>
        </div>`;
            }
            data = data.replace("{catelogies}", cateText);
            data = data.replace("{products}", productText);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data);
            return res.end();
          }
        });
        break;
      }
    }
  }
});

server.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
