// import React, { useEffect, useState } from 'react'
// import TypeProduct from '../../components/TypeProduct/TypeProduct'
// import {
//   WrapperButtonMore,
//   WrapperProducts,
//   WrapperTypeProduct,
//   WrapperSection,
//   SectionTitle
// } from './style'
// import SliderComponent from '../../components/SliderComponent/SliderComponent'
// import slider1 from '../../assets/images/slider1.webp'
// import slider2 from '../../assets/images/slider2.webp'
// import slider3 from '../../assets/images/slider3.webp'
// import slider4 from '../../assets/images/slider4.svg'

// import CardComponent from '../../components/CardComponent/CardComponent'
// import * as ProductService from '../../service/ProductService'
// import { useQuery } from '@tanstack/react-query'
// import { useSelector } from 'react-redux'
// import Loading from '../../components/LoadingComponent/Loading'
// import { useDebounce } from '../../hooks/useDebounce'
// import { useNavigate } from 'react-router-dom'



// const HomePage = () => {
//   const searchProduct = useSelector((state) => state?.product?.search); 
//   const searchDebounce = useDebounce(searchProduct, 500)
//   const [loading, setLoading] = useState(false)
//   const [limit, setLimit] = useState(6)
//   const [typeProducts, setTypeProducts] = useState([])
//   const navigate = useNavigate()

//   const fetchProductAll = async (context) => {
//     const search = context?.queryKey && context?.queryKey[2]
//     const limit = context?.queryKey && context?.queryKey[1]
//     const res = await ProductService.getAllProduct(search, limit);
//       return res
//   };

//   const fetchAllTypeProduct = async () => {
//     const res = await ProductService.getAllTypeProduct()
//     if(res?.status === 'OK') {
//       setTypeProducts(res?.data)
//     }
//   }

//   //const {isPending, data: products} = useQuery(['products'], fetchProductAll, { retry: 3, retryDelay: 1000 })
//   const { isPending, data: products, isPreviousData } = useQuery({
//     queryKey: ['product', limit, searchDebounce],
//     queryFn: fetchProductAll,
//     retry: 3,
//     retryDelay: 1000,
//     keepPreviousData: true
//   });

//   useEffect(() => {
//     fetchAllTypeProduct()
//   }, [])

//   const productQueries = useQuery({
//     queryKey: ['products-by-type', typeProducts],
//     queryFn: async () => {
//       const results = await Promise.all(
//         typeProducts.map(type => ProductService.getProductByType(type))
//       );
//       return typeProducts.reduce((acc, type, index) => {
//         acc[type] = results[index]?.data || [];
//         return acc;
//       }, {});
//     },
//     enabled: typeProducts.length > 0,
//   });
  
//   return (
//     <Loading isPending={isPending || loading}>
//       <div style={{width: '1270px', margin:'0 auto'}}>
//         {/* <WrapperTypeProduct>
//         {typeProducts.map((item) =>{
//           return (
//             <TypeProduct name={item} key={item} />
//           )
//         })}
//         </WrapperTypeProduct> */}
//         </div>
//         <div className='body' style={{width:'100%', backgroundColor:'#efefef'}}>
//           <div id="container" style={{height:'1000px', width:'1270px', margin: '0 auto'}}>
//             <SliderComponent arrImages={[ slider4, slider4, slider4]} />
//             <WrapperProducts>
//               {products?.data?.map((product) => {
//                 return(
//                   <CardComponent 
//                   key={product._id} 
//                   countInstock={product.countInstock} 
//                   description={product.description} 
//                   image={product.image} name={product.name} 
//                   price={product.price} 
//                   rating={product.rating}
//                   type={product.type}
//                   selled={product.selled}
//                   discount={product.discount}
//                   id={product._id}
//                   />
//                 )
//               })}



//             </WrapperProducts>
//             <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
//               <WrapperButtonMore 
//                 textButton={isPreviousData ? 'Tải thêm' : 'Xem thêm'} type="outline" styleButton={{
//                 border: '1px solid rgb(11,116,229)',
//                 color: `${products?.total === products?.data?.length ? '#ccc': 'rgb(11,116,229)'}`,
//                 width: '240px',
//                 height: '38px',
//                 borderRadius: '4px'
//               }}
//               disabled={products?.total === products?.data?.length || products.totalPage === 1}
//               styleTextButton={{fontWeight: '500', color: products?.total === products?.data?.length && '#fff'}}
//               onClick={() => setLimit((prev) => prev + 6)}
//               />
//             </div>
            
//           </div>
//         </div>
//       </Loading>
//   )
// }

// export default HomePage

import React, { useEffect, useState } from 'react'
import TypeProduct from '../../components/TypeProduct/TypeProduct'
import {
  WrapperButtonMore,
  WrapperProducts,
  WrapperTypeProduct,
  WrapperSection,
  SectionTitle
} from './style'
import SliderComponent from '../../components/SliderComponent/SliderComponent'
import slider4 from '../../assets/images/slider4.svg'

import CardComponent from '../../components/CardComponent/CardComponent'
import * as ProductService from '../../service/ProductService'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import Loading from '../../components/LoadingComponent/Loading'
import { useDebounce } from '../../hooks/useDebounce'
import { useNavigate } from 'react-router-dom'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'

const HomePage = () => {
  const searchProduct = useSelector((state) => state?.product?.search)
  const searchDebounce = useDebounce(searchProduct, 500)
  const [limit, setLimit] = useState(5)
  const [typeProducts, setTypeProducts] = useState([])
  const navigate = useNavigate()
  const [productLimits, setProductLimits] = useState({})
  const [productsByType, setProductsByType] = useState({})
  const [loadingTypes, setLoadingTypes] = useState({})
  const [allLoaded, setAllLoaded] = useState({})
  const [searchResults, setSearchResults] = useState([])
  const [searchAllLoaded, setSearchAllLoaded] = useState(false)
  const [fetchKey, setFetchKey] = useState(0) // Trigger reload products
  const [loading, setLoading] = useState(false)

  const fetchProductAll = async ({ queryKey }) => {
    const [, , search] = queryKey
    console.log('🔍 fetchProductAll search:', search)
    if (!search) return Promise.resolve({ data: [] }) // Fix here
    return await ProductService.getAllProduct(search, 9999)
  }
  
  

  const fetchAllTypeProduct = async () => {
    const res = await ProductService.getAllTypeProduct()
    if (res?.status === 'OK') {
      setTypeProducts(res?.data)
      const initialLimits = {}
      res?.data.forEach(type => {
        initialLimits[type] = 5
      })
      setProductLimits(initialLimits)
    }
  }

  const { isPending, data: searchData, isFetching } = useQuery({
    queryKey: ['product', 'search', searchDebounce],
    queryFn: fetchProductAll,
    enabled: !!searchDebounce && searchDebounce.length > 0,
    suspense: false,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000,
    keepPreviousData: true
  })
  

  useEffect(() => {
    fetchAllTypeProduct()
  }, [])

  useEffect(() => {
    if (!searchDebounce) {
      setSearchResults([])
      setSearchAllLoaded(false)
      setLimit(5)
      fetchAllTypeProduct()
      setFetchKey(prev => prev + 1) // Force re-fetch
    }
  }, [searchDebounce])

  useEffect(() => {
    const fetchProducts = async () => {
      for (const type of typeProducts) {
        setLoadingTypes(prev => ({ ...prev, [type]: true }))
        const res = await ProductService.getProductByType(type, 9999)
        setLoadingTypes(prev => ({ ...prev, [type]: false }))

        const fullProducts = res?.data || []

        setProductsByType(prev => ({
          ...prev,
          [type]: fullProducts
        }))

        setAllLoaded(prev => {
          const limit = productLimits[type] || 5
          return {
            ...prev,
            [type]: limit >= fullProducts.length
          }
        })
      }
    }

    if (typeProducts.length > 0 && !searchDebounce) {
      fetchProducts()
    }
  }, [typeProducts, productLimits, searchDebounce, fetchKey])

  useEffect(() => {
    if (searchData?.data) {
      setSearchResults(searchData.data.slice(0, 5))
      setSearchAllLoaded(searchData.data.length <= 5)
    } else {
      setSearchResults([])
      setSearchAllLoaded(true)
    }
  }, [searchData])

  const handleShowMoreSearch = () => {
    if (searchData?.data) {
      const newLimit = searchResults.length + 5
      const newResults = searchData.data.slice(0, newLimit)
      setSearchResults(newResults)
      setSearchAllLoaded(newLimit >= searchData.data.length)
    }
  }
  // console.log('searchDebounce:', searchDebounce)
  // console.log('isPending:', isPending)
  // console.log('isFetching:', isFetching)
  // console.log('searchData:', searchData)
  
  return (
    <Loading isPending={(!!searchDebounce && (isPending || isFetching)) || Object.values(loadingTypes).some(v => v)}>
      <div style={{ width: '1270px', margin: '0 auto' }}></div>
      <div className='body' style={{ width: '100%', backgroundColor: '#efefef' }}>
        <div id="container" style={{ paddingBottom: '60px', width: '1270px', margin: '0 auto' }}>
          <SliderComponent arrImages={[slider4, slider4, slider4]} />

          {searchDebounce ? (
            <WrapperSection>
              <SectionTitle>KẾT QUẢ TÌM KIẾM</SectionTitle>
              <WrapperProducts>
                {searchResults.map(product => (
                  <CardComponent
                    key={product._id}
                    countInstock={product.countInstock}
                    description={product.description}
                    image={product.image}
                    name={product.name}
                    price={product.price}
                    rating={product.rating}
                    type={product.type}
                    selled={product.selled}
                    discount={product.discount}
                    id={product._id}
                  />
                ))}
              </WrapperProducts>
              {!searchAllLoaded && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <WrapperButtonMore
                    textButton={'Xem thêm'}
                    type="outline"
                    onClick={handleShowMoreSearch}
                  />
                </div>
              )}
            </WrapperSection>
          ) : (
            <>
              {typeProducts.length === 0 || Object.keys(productsByType).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải sản phẩm...</div>
              ) : (
                typeProducts.map((type) => {
                  const limit = productLimits[type] || 5
                  const products = (productsByType[type] || []).slice(0, limit)

                  return (
                    <WrapperSection key={type}>
                      <SectionTitle>{type.toUpperCase()}</SectionTitle>
                      <WrapperProducts>
                        {products.map(product => (
                          <CardComponent
                            key={product._id}
                            countInstock={product.countInstock}
                            description={product.description}
                            image={product.image}
                            name={product.name}
                            price={product.price}
                            rating={product.rating}
                            type={product.type}
                            selled={product.selled}
                            discount={product.discount}
                            id={product._id}
                          />
                        ))}
                      </WrapperProducts>
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <WrapperButtonMore
                          textButton={loadingTypes[type] ? 'Đang tải...' : allLoaded[type] ? 'Đã tải hết' : 'Xem thêm'}
                          type="outline"
                          styleButton={{
                            background: allLoaded[type] ? '#ccc' : '#fff',
                          }}
                          styleTextButton={{
                            fontWeight: '500',
                            color: allLoaded[type] ? '#999' : '#000',
                          }}
                          disabled={loadingTypes[type] || allLoaded[type]}
                          onClick={() => {
                            if (!loadingTypes[type] && !allLoaded[type]) {
                              setProductLimits(prev => {
                                const newLimit = (prev[type] || 5) + 5
                                const total = productsByType[type]?.length || 0

                                const newAllLoaded = newLimit >= total

                                setAllLoaded(prevLoaded => ({
                                  ...prevLoaded,
                                  [type]: newAllLoaded
                                }))

                                return {
                                  ...prev,
                                  [type]: newLimit
                                }
                              })
                            }
                          }}
                        />
                      </div>
                    </WrapperSection>
                  )
                })
              )}
            </>
          )}
        </div>
      </div>
    </Loading>
  )
}

export default HomePage
