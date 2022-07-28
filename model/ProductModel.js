const Connection = require('./connection').createConnection()

module.exports = class ProductModel {


    static getProduct() {
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

    static deleteProduct(idDelete) {
        const id = parseInt(idDelete)
        return new Promise((resolve, reject) => {
            let sql = `call DeleteProduct(${id});`
            // let sql = `deleteProduct(${idDelete})`
            Connection.query(sql, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve('delete ok')
            })
        })
    }
static updateProduct(idUpdate) {
    const id = parseInt(idUpdate)
    return new Promise((resolve, reject) => {
        let sql = `call DeleteProduct(${id});`
        Connection.query(sql, (err, result) => {
            if (err) {
                reject(err)
            }
            resolve('delete ok')
        })
    })

}

}



