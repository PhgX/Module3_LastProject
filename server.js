const fs = require("fs");
const http = require("http");
const url = require("url");
const qs = require("qs");
const checkRegister = require("./controller/signup");
const Connection = require("./model/connection");
const LoginControl = require("./controller/loginAccount");
const ProductModel = require("./model/ProductModel");

let connection = Connection.createConnection({ multipleStatements: true });
const loginController = new LoginControl();
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
  svg: "image/avg+xml",
};
let currentUserId = -1;
let currentOrderId;
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
    let queryProducts = `select p.name, p.price, p.id, c.name as catename
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
    /\.js|.css|.jpg|.png|.gif|min.js|min.css|.woff|.ttf|.woff2|.eot|.svg/
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
            let topPage = ``;
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
                </div>
                <div class="featured__item__text">
                    <h6><a href="#">${products[i].name}</a></h6>
                    <h5>${products[i].price} VND</h5>
                </div>
            </div>
        </div>`;
            }
            data = data.replace("{top-page}", topPage);
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
          loginController.LoginControl(req, res);
        }
        break;
      }
      case "/signup": {
        if (req.method === "GET") {
          fs.readFile("./views/login/signup.html", "utf-8", (err, data) => {
            if (err) {
              console.log(err);
            } else {
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(data);
              return res.end();
            }
          });
        } else {
          checkRegister.SignUpAccount(req, res);
        }
        break;
      }
      case "/admin": {
        ProductModel.getProduct().then((listProduct) => {
          fs.readFile("./views/home/admin.html", "utf-8", (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let html = "";
              listProduct.forEach((product, index) => {
                html += "<tr>";
                html += `<td >${product.id}</td>`;
                html += `<td >${product.name}</td>`;
                html += `<td>${product.price}</td>`;

                html += `<td>
                                <button type="button" value="${product.id}" class="btn btn-danger"> <a href="/products/delete?id=${product.id}">Delete</a></button>
               
                                <button type="button" value="${product.id}" class="btn btn-warning"><a href="/products/update?id=${product.id}">Update</a></button>
                            </td>`;

                html += "</tr>";
              });
              data = data.replace("{list-products}", html);
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(data);
              res.end();
            }
          });
        });
        break;
      }
      case "/user": {
        let query = qs.parse(urlParse.query);
        let idUpdate = query.id;
        currentUserId = idUpdate;
        currentOrderId = loginController.orderId;
        let method = req.method;
        console.log(idUpdate);
        console.log(currentOrderId);
        if (method === "GET") {
          console.log("get");
          fs.readFile("./views/home/user.html", "utf-8", async (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let categories = await getCate();
              let products = await getProducts();
              let cateText = "";
              let productText = "";
              let topPage = `Welcome user`;
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
                          <form action="/user?id=${currentUserId}" method = "post">
                          <input type="number"  placeholder="Amount" name="amount" id="amount" >
                          <button type="submit" name="productid" value=${products[i].id} class="site-btn">BUY</button>
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
              data = data.replace("{top-page}", topPage);
              data = data.replace("{catelogies}", cateText);
              data = data.replace("{products}", productText);
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(data);
              return res.end();
            }
          });
        } else {
          console.log("post");
          let data = "";
          req.on("data", (chunk) => {
            data += chunk;
          });
          req.on("end", () => {
            let product = qs.parse(data);
            let productid = product.productid;
            let productPrice = 0;
            let amount = product.amount;
            function getProductPrice(productid,amount,productPrice,currentOrderId, callback) {
              let queryGetProductPrice = `select price from products where id = ${productid};`;
              connection.query(queryGetProductPrice, (err, data) => {
                let parseData = qs.parse(data[0]);
                productPrice = parseData.price;
                callback(amount, productPrice, productid, currentOrderId);
              });
            }
            function insertOrder(
              amount,
              productPrice,
              productid,
              currentOrderId
            ) {
              let price = amount * productPrice;
              console.log(price);
              let queryInsertOrder = `insert into orderdetails(product_id,amount,price,orderid) values (${productid},${amount},${price},${currentOrderId});`;
              connection.query(queryInsertOrder, (err, data) => {});
            }
            getProductPrice(productid,amount,productPrice,currentOrderId,insertOrder)
            res.writeHead(301, {
              location: `/user?id=${currentUserId}`,
            });
            return res.end();
          });

          fs.readFile("./views/home/user.html", "utf-8", async (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let categories = await getCate();
              let products = await getProducts();
              let cateText = "";
              let productText = "";
              let topPage = `Welcome user`;
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
                          <form action="/user?id=${currentUserId}" method = "post">
                          <input type="number"  placeholder="Amount" name="amount" id="amount" >
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
              data = data.replace("{top-page}", topPage);
              data = data.replace("{catelogies}", cateText);
              data = data.replace("{products}", productText);
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(data);
              return res.end();
            }
          });
        }

        break;
      }
      case '/cart' : {
        fs.readFile('views/home/cart.html', 'utf-8', (err, data) => {
          if (err) {
              console.log(err);
          } else {
              res.writeHead(200, {'Content-Type': 'text/html'});
              res.write(data);
              return res.end();
          }
      });
        break
      }
    }
  }
});

server.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
