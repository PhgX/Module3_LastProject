const Connection = require('./connection').createConnection()

module.exports = class ProductModel {


    static getProduct() {
        return new Promise((resolve, reject) => {
            let sql = `SELECT p.id, p.name, p.price, p.image
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
    static updateProduct(idUpdate,newName,newPrice) {
        const idInt=parseInt(idUpdate)
        const priceInt = parseInt(newPrice)

        return new Promise((resolve, reject) => {
            let sql = `call UpdateProduct(${idInt},"${newName}",${priceInt});`
            Connection.query(sql, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve('Update Product successfully')
            })
        })
    }


static findProduct(id){
        return new Promise((resolve, reject) => {
            let sql = `SELECT p.id, p.name, p.price
                       FROM products p where p.id = ${id}`
            Connection.query(sql, (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
        })
    }

}



