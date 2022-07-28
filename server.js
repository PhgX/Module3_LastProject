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
function getOrders(userId) {
  return new Promise((resolve, reject) => {
    let queryOrders = `select u.id, p.name, p.price, od.price as total, od.amount
    from users u join orders o on u.id = o.user_id join orderdetails od on o.id = od.orderid join products p on od.product_id = p.id
    where u.id = ${userId} ;`;
    connection.query(queryOrders, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
function getTotal(currentUserId,currentOrderId) {
  return new Promise((resolve,reject) => {
    let queryOrders = `select u.id, o.id, p.name, p.price, od.price as total , od.amount
    from users u join orders o on u.id = o.user_id join orderdetails od on o.id = od.orderid join products p on od.product_id = p.id
    where u.id = ${currentUserId} and o.id = ${currentOrderId};`;
    connection.query(queryOrders, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
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
      case "/products/delete": {
        // b1: tìm id xoá

//lấy toàn bộ url /product/delete?id = `${product.id};
        const parseUrl = url.parse(req.url, true);
        // lấy sau dấu ? và biến chuỗi query thành object {id:product.id}
        let  queryString = qs.parse(parseUrl.query);
        //lấy ra id xoá
        const idDelete = queryString.id


        //b2: lấy dc id xoá, tiến hành xoá trong csdl

        ProductModel.deleteProduct( idDelete)
            .then(result=>{
          console.log(result);
            })
            .catch()
        //b3: render lại giao diện.
        res.writeHead(301,{location: '/admin'});
        res.end();



        break;
      }

      // case "/products/update": {
      //
      //   if(req.method === "GET"){
      //     fs.readFile('./views/home/update.html', "utf-8",(err,data)=>{
      //       if(err){
      //         console.log(err);
      //       }
      //       res.writeHead(200, { "Content-Type": "text/html" });
      //
      //       res.write(data);
      //       res.end();
      //     })
      //   } else {
      //      //tim id update
      //     const parseUrl = url.parse(req.url, true)
      //     let  idUpdate=qs.parse(parseUrl.query).id;
      //     // lay id update sua trong co so su lieu
      //     ProductModel.updateProduct(idUpdate)
      //         .then(res => {
      //           res.writeHead(200, { "Content-Type": "text/html" });
      //           data=data.replace('{idUpdate}',`${idUpdate}`)
      //           data=data.replace('{valueName}',`${result[0].name}`)
      //           data=data.replace('{valuePrice}',`${result[0].price}`)
      //
      //           res.write(data);
      //           res.end();
      //           res.writeHead(301,{location: '/admin'});
      //           res.end();
      //         }
      //     ).catch()
      //   }
      //
      //   break;
      // }
      case "/products/update": {





        if(req.method === "GET"){

          let parseUrl = url.parse(req.url, true)
          let  idUpdate=qs.parse(parseUrl.query).id;

          ProductModel.findProduct(idUpdate)
              .then(result => {
                console.log(result);
                fs.readFile('./views/home/update.html', "utf-8",(err,data)=>{
                  if(err){
                    console.log(err);
                  }
                  res.writeHead(200, { "Content-Type": "text/html" });
                  data=data.replace('{idUpdate}',`${idUpdate}`)
                  data=data.replace('{valueName}',`${result[0]["name"]}`)
                  data=data.replace('{valuePrice}',`${result[0]["price"]}`)

                  res.write(data);
                  res.end();
                })
              })
              .catch(err => {
                console.log(err)})


          // fs.readFile('./views/home/update.html', "utf-8",(err,data)=>{
          //   if(err){
          //     console.log(err);
          //   }
          //   res.writeHead(200, { "Content-Type": "text/html" });
          //   data=data.replace('{idUpdate}',`${idUpdate}`)
          //   res.write(data);
          //   res.end();
          // })
        }
        else{
          //b1: tim id update ,lay gia tri new name , new price

          let data=''
          req.on('data', chunk => {
            data+=chunk
            // console.log(data)
          })
          req.on('end', async  () =>{
            let product = await qs.parse(data)
            // console.log({product})
            let idUpdate=product.id;
            let newName = product.nameEdit;
            let newPrice = product.priceEdit;


            //b2:lay idUpdate newNameProduct newNamePrice sua trong co so su lieu
            await ProductModel.updateProduct(idUpdate,newName,newPrice)
                .then(result=>console.log(result))
                .catch(err=>console.log(err))


            //b3:render giao dien
            res.writeHead(301,{location: '/admin'});
            res.end();
          })



        }


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
              let cartText = `<li><a href="/cart?id=${currentUserId}">Cart</a></li>`;
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
              data = data.replace("{cart}", cartText);
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
        let query = qs.parse(urlParse.query);
        let idUpdate = query.id;
        currentUserId = idUpdate;
        let cartText = ``;
        let continueBuy = `<li><a href="/user?id=${currentUserId}">Buy</a></li>`
        let continueShoppingText = `<a href="/user?id=${currentUserId}" class="primary-btn cart-btn">CONTINUE SHOPPING</a>`;
        fs.readFile('views/home/cart.html', 'utf-8', async (err, data) => {
          if (err) {
              console.log('File NotFound!');
          } else {
            let sum = 0;
              let product = await getOrders(currentUserId);
              // let total = await getTotal(currentUserId,currentOrderId);
              // console.log(total)
              // for (let i = 0;i<total.length;i++) {
              //   sum += total[i].total
              
              // }
              // console.log(sum)
              if (product.length > 0) {
                for (let i = 0; i < product.length; i++) {
                  sum += product[i].total
                  cartText += `<tr>
                  <td class="shoping__cart__item">
                      <img src="assets/home/img/product/product-1.jpg" alt="">
                      <h5>${product[i].name}</h5>
                  </td>
                  <td class="shoping__cart__price">
                      ${product[i].price}
                  </td>
                  <td class="shoping__cart__price">
                      ${product[i].amount}
                  </td>
                  <td class="shoping__cart__total">
                  ${product[i].total}
                  </td>
                  <td class="shoping__cart__item__close">
                      <span class="icon_close"></span>
                  </td>
              </tr>`
                }
              }
              
              data = data.replace("{continue-buy}", continueBuy);
              data = data.replace("{Total-Price}", sum);
              data = data.replace("{continue-shopping}", continueShoppingText);
              data = data.replace("{cart}", cartText);
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

server.listen(8989, () => {
  console.log("Server is running on http://localhost:8989");
});
