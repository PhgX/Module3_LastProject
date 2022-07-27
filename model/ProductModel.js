const Connection = require('./connection').createConnection()

module.exports = class ProductModel {


    static getProduct() {
        return new Promise((resolve, reject) => {
            let sql = `select p.id, p.name, p.price
                       from products p
            `
            Connection.query(sql, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
        })
    }

    static deleteProduct(index) {
        return new Promise((resolve, reject) => {
            // let sql = `delete from orderdetails where product_id = id=${index}`
            let sql = `delete
                       from products
                       where id = ${index}`
            Connection.query(sql, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve('delete ok')
            })
        })
    }


}

