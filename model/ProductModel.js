const Connection = require('./connection').createConnection()

module.exports = class ProductModel {


     getProduct() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT p.id, p.name, p.price
                       FROM products p
            `
            Connection.query(sql, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
        })
    }

     deleteProduct(index) {
        return new Promise((resolve, reject) => {
            // let sql = `DeleteProduct(${index});`
            let sql = `deleteProduct(${index})`
            Connection.query(sql, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve('delete ok')
            })
        })
    }


}

