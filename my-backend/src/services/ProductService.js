const Product = require("../models/ProductModel")
const bcrypt = require("bcrypt")
const mongoose = require('mongoose');
const Order = require('../models/OrderProduct');
const { normalizeVariants, totalVariantStock } = require('../utils/productVariants');

// const createProduct = (newProduct) => {
//     return new Promise(async (resolve, reject) => {
//         const { name, image, type, price, countInStock, rating, description, discount, sizes, colors} = newProduct

//         try {
//             const checkProduct = await Product.findOne({
//                 name: name
//             })
//            if(checkProduct !== null) {
//                 resolve({
//                     status: 'OK',
//                     message: 'The name of product is already'
//                 })
//            }
           
//             const newProduct = await Product.create({
//                 name, 
//                 image, 
//                 type, 
//                 price,
//                 countInStock: Number(countInStock), 
//                 rating, 
//                 description,
//                 discount: Number(discount),
//                 sizes,
//                 colors
//             })
//             if(newProduct) {
//                 resolve({
//                     status: 'OK',
//                     message: 'SUCCESS',
//                     data: newProduct
//                 })
//             }
//         } catch (e) {
//             reject(e)
//         }
//     })
// }

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, image, type, price, countInStock, rating, description, discount, sizes, colors, subImages } = newProduct

        try {
            const checkProduct = await Product.findOne({ name })
            if (checkProduct !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The name of product is already'
                })
            }

            const variants = normalizeVariants(newProduct.variants, price)
            const createdProduct = await Product.create({
                name,
                image,
                subImages: subImages || [],
                type,
                price,
                countInStock: variants.length ? totalVariantStock(variants) : Number(countInStock),
                rating,
                description,
                discount: Number(discount),
                sizes,
                colors,
                variants
            })

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: createdProduct
            })
        } catch (e) {
            reject(e)
        }
    })
}


const updateProduct = (id, data) => {
    return new Promise(async (resolve, reject) => {

        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if(checkProduct === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            const updateData = { ...data }
            if (Object.prototype.hasOwnProperty.call(data, 'variants')) {
                updateData.variants = normalizeVariants(data.variants, data.price ?? checkProduct.price)
                updateData.countInStock = updateData.variants.length
                    ? totalVariantStock(updateData.variants)
                    : Number(data.countInStock ?? checkProduct.countInStock)
            }
            const updateProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updateProduct
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {

        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if(checkProduct === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The Product is not defined'
                })
            }

            await Product.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'Delete SUCCESS'
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const deleteManyProduct = (ids) => {
    return new Promise(async (resolve, reject) => {

        try {
            await Product.deleteMany({_id: ids})
            resolve({
                status: 'OK',
                message: 'Delete SUCCESS'
                     
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const getAllProduct = (limit, page, sort, filter) => {
    return new Promise(async (resolve, reject) => {
      try {
        const totalProduct = await Product.countDocuments()
        let allProduct = []
  
        if (filter) {
          const label = filter[0]
          const allObjectFilter = await Product.find({
            [label]: { '$regex': filter[1], '$options': 'i' } // Thêm options để tìm không phân biệt hoa thường
          }).limit(limit).skip(page * limit)
  
          return resolve({
            status: 'OK',
            message: 'SUCCESS',
            data: allObjectFilter,
            total: totalProduct,
            pageCurrent: Number(page + 1),
            totalPage: Math.ceil(totalProduct / limit)
          })
        }
  
        if (sort) {
          const objectSort = {}
          objectSort[sort[1]] = sort[0]
          const allProductSort = await Product.find().limit(limit).skip(page * limit).sort(objectSort)
  
          return resolve({
            status: 'OK',
            message: 'SUCCESS',
            data: allProductSort,
            total: totalProduct,
            pageCurrent: Number(page + 1),
            totalPage: Math.ceil(totalProduct / limit)
          })
        }
  
        // Trường hợp không có filter / sort
        if (!limit) {
          allProduct = await Product.find()
        } else {
          allProduct = await Product.find().limit(limit).skip(page * limit)
        }
  
        return resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: allProduct,
          total: totalProduct,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalProduct / limit)
        })
  
      } catch (e) {
        reject(e)
      }
    })
  }

// const getAllProduct = (limit = 10, page = 0, sort, filter) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const query = {};
//       if (filter && filter.length === 2) {
//         query[filter[0]] = { $regex: filter[1], $options: 'i' };
//       }

//       const totalProduct = await Product.countDocuments(query);

//       let productsQuery = Product.find(query)
//         .select('name price image rating') // Giới hạn field
//         .limit(limit)
//         .skip(page * limit)
//         .lean();

//       if (sort && sort.length === 2) {
//         const sortQuery = {};
//         sortQuery[sort[1]] = sort[0]; // e.g. { price: 'asc' }
//         productsQuery = productsQuery.sort(sortQuery);
//       }

//       const allProduct = await productsQuery;

//       resolve({
//         status: 'OK',
//         message: 'SUCCESS',
//         data: allProduct,
//         total: totalProduct,
//         pageCurrent: Number(page + 1),
//         totalPage: Math.ceil(totalProduct / limit),
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

  

const getAllType = () => {
    return new Promise(async (resolve, reject) => {

        try {
            const allType = await Product.distinct('type')
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allType,
            })
            //
            
        } catch (e) {
            reject(e)
        }
    })
}

const getDetailProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findOne({
                _id: id
            })
            if(product === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: product
                     
            })            
        } catch (e) {
            reject(e)
        }
    })
}

// const getProductByType = (type, limit = 6) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const products = await Product.find({ type }).limit(limit)
//         resolve({
//           status: 'OK',
//           message: 'SUCCESS',
//           data: products
//         })
//       } catch (e) {
//         reject({
//           status: 'ERR',
//           message: e.message
//         })
//       }
//     })
//   }

const getProductByType = (type, page = 0, limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalProduct = await Product.countDocuments({ type })
      const products = await Product.find({ type })
        .skip(page * limit)
        .limit(limit)

      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: products,
        totalProduct,
        totalPage: Math.ceil(totalProduct / limit),
        pageCurrent: Number(page + 1)
      })
    } catch (e) {
      reject({
        status: 'ERR',
        message: e.message
      })
    }
  })
}


  
//   const getTopSellingProducts = (limit = 5) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const products = await Product.find().sort({ selled: -1 }).limit(limit);
//         resolve({
//           status: 'OK',
//           message: 'SUCCESS',
//           data: products,
//         });
//       } catch (e) {
//         reject({
//           status: 'ERR',
//           message: e.message,
//         });
//       }
//     });
//   };

const getTopSellingProducts = (limit = 5) => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await Product.find()
        .sort({ selled: -1 })
        .limit(limit)
        .select('name image price rating discount selled') // giới hạn field
        .lean(); // tối ưu hiệu suất

      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: products,
      });
    } catch (e) {
      reject({
        status: 'ERR',
        message: e.message,
      });
    }
  });
};

  
//   const getTopNewProducts = (limit = 5) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const products = await Product.find().sort({ createdAt: -1 }).limit(limit);
//         resolve({
//           status: 'OK',
//           message: 'SUCCESS',
//           data: products,
//         });
//       } catch (e) {
//         reject({
//           status: 'ERR',
//           message: e.message,
//         });
//       }
//     });
//   };

const getTopNewProducts = (limit = 5) => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name image price rating discount selled createdAt') // chỉ field cần thiết
        .lean();

      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: products,
      });
    } catch (e) {
      reject({
        status: 'ERR',
        message: e.message,
      });
    }
  });
};


const addReview = (productId, userId, rating, comment) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!productId || !userId) {
                return reject({
                    status: 'ERR',
                    message: 'Product ID or User ID is missing',
                });
            }
            if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(userId)) {
                return reject({
                    status: 'ERR',
                    message: 'Invalid product or user ID',
                });
            }

            if (!rating || rating < 1 || rating > 5) {
                return reject({
                    status: 'ERR',
                    message: 'Rating must be between 1 and 5',
                });
            }
            if (!comment || comment.trim() === '' || comment.trim().length > 1000) {
                return reject({
                    status: 'ERR',
                    message: 'Comment must contain between 1 and 1000 characters',
                });
            }

            const product = await Product.findById(productId);
            if (!product) {
                console.error('Product not found:', { productId });
                return reject({
                    status: 'ERR',
                    message: 'Product not found',
                });
            }

            const purchased = await Order.exists({
                user: userId,
                status: 'delivered',
                'orderItems.product': productId,
            });
            if (!purchased) {
                return reject({ status: 'ERR', message: 'Chỉ khách đã nhận sản phẩm mới có thể đánh giá' });
            }

            const existingReview = product.reviews.find(
                (review) => review.user.toString() === userId.toString()
            );
            if (existingReview) {
                return reject({
                    status: 'ERR',
                    message: 'You have already reviewed this product',
                });
            }

            const newReview = {
                user: userId,
                rating,
                comment: comment.trim(),
                createdAt: new Date(),
            };
            product.reviews.push(newReview);

            const totalRatings = product.reviews.length;
            const totalScore = product.reviews.reduce((acc, review) => acc + review.rating, 0);
            product.rating = totalScore / totalRatings;

            await product.save();

            resolve({
                status: 'OK',
                message: 'Review added successfully',
                data: newReview,
            });
        } catch (e) {
            console.error('Error in addReview:', {
                error: e.message,
                stack: e.stack,
                productId,
                userId,
            });
            reject({
                status: 'ERR',
                message: e.message || 'An error occurred while adding the review',
                errorDetails: e.name,
            });
        }
    });
};

  
const getReviews = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!mongoose.isValidObjectId(productId)) {
                return reject({
                    status: 'ERR',
                    message: 'Invalid product ID',
                });
            }

            const product = await Product.findById(productId)
                .select('reviews') // Chỉ lấy trường reviews
                .populate('reviews.user', 'name avatar'); // Lấy name và avatar từ bảng User

            if (!product) {
                return reject({
                    status: 'ERR',
                    message: 'Product not found',
                });
            }
            console.log('Fetched reviews:', product.reviews); // Log dữ liệu reviews

            resolve({
                status: 'OK',
                message: 'Reviews fetched successfully',
                data: product.reviews,
            });
        } catch (e) {
            console.error('Error in getReviews:', {
                error: e.message,
                stack: e.stack,
                productId,
            });
            reject({
                status: 'ERR',
                message: e.message || 'An error occurred while fetching reviews',
                errorDetails: e.name,
            });
        }
    });
};

module.exports = {
    createProduct,
    updateProduct,
    getDetailProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getAllType,
    getProductByType,
    getTopSellingProducts,
    getTopNewProducts,
    addReview,
    getReviews,
    
    
}
