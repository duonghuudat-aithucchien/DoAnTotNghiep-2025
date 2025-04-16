const getAllProduct = (limit, page, sort) => {
    console.log('sort', sort)
    return new Promise(async (resolve, reject) => {

        try {
            const totalProduct = await Product.countDocuments()
            if (sort) {
                const objectSort = {}
                objectSort[ sort[1]] = sort[0]
                const allProductSort = await Product.find().limit(limit).skip(page * limit).sort(objectSort)
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allProductSort,
                    total: totalProduct,
                    pageCurrent: Number(page + 1),
                    totalPage: Math.ceil(totalProduct / limit)
                         
                })
            }
            const allProduct = await Product.find().limit(limit).skip(page * limit).sort({
                name: sort
            })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allProduct,
                total: totalProduct,
                pageCurrent: Number(page + 1),
                totalPage: Math.ceil(totalProduct / limit)
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}