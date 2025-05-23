
import React, { useEffect, useState, Suspense } from 'react'
import TypeProduct from '../../components/TypeProduct/TypeProduct'
import {
  WrapperButtonMore,
  WrapperProducts,
  WrapperTypeProduct,
  WrapperSection,
  SectionTitle,
  ArrowButton
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
import ProductScrollWithArrows from './ProductScrollWithArrows';
import FlashSaleCountdown from './FlashSaleCountdown';

const FlashSaleCountdown1 = React.lazy(() => import('./FlashSaleCountdown'));


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
  const [topSelling, setTopSelling] = useState([])
  const [topNew, setTopNew] = useState([])
  const [topSellingLimit, setTopSellingLimit] = useState(5)
  const [topNewLimit, setTopNewLimit] = useState(5)
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);



  const fetchProductAll = async ({ queryKey }) => {
    const [, , search] = queryKey
    if (!search) return Promise.resolve({ data: [] })
    return await ProductService.getAllProduct(search, 9999)
  }
  
  useEffect(() => {
    const fetchTopData = async () => {
      const [sellingRes, newRes] = await Promise.all([
        ProductService.getTopSellingProducts(8),
        ProductService.getTopNewProducts(8)
      ])
      setTopSelling(sellingRes?.data || [])
      setTopNew(newRes?.data || [])
    }
    fetchTopData()
  }, [])
  
  useEffect(() => {
    const fetchFlashSale = async () => {
      const res = await ProductService.getTopSellingProducts(8); 
      setFlashSaleProducts(res?.data || []);
    };
    fetchFlashSale();
  }, []);

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

  
  return (
    <Loading isPending={(!!searchDebounce && (isPending || isFetching)) || Object.values(loadingTypes).some(v => v)}>
      <div style={{ width: '1270px', margin: '0 auto' }}></div>
      <div className='body' style={{ width: '100%', backgroundColor: '#fff' }}>
        <div id="container" style={{ paddingBottom: '60px', width: '1270px', margin: '0 auto' }}>
          <SliderComponent arrImages={[slider4, slider4, slider4]} />
         <WrapperSection>
            <SectionTitle>FLASH SALE</SectionTitle>
            {/* Sử dụng Suspense để bọc FlashSaleCountdown */}
            <Suspense fallback={<div>Đang tải Flash Sale...</div>}>
              <FlashSaleCountdown1 endTime="2025-05-18T23:59:59" />
            </Suspense>
            <ProductScrollWithArrows>
              {flashSaleProducts.map(product => (
                <CardComponent
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
            </ProductScrollWithArrows>
          </WrapperSection>

          {/* {searchDebounce ? (
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
          )} */}

        {searchDebounce ? (
          <WrapperSection>
            <SectionTitle>KẾT QUẢ TÌM KIẾM</SectionTitle>
            <WrapperProducts>
              {searchResults.map(product => (
                <CardComponent 
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
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <WrapperButtonMore textButton="Xem thêm" type="outline" onClick={handleShowMoreSearch} />
              </div>
            )}
          </WrapperSection>
        ) : (
          <>
        <WrapperSection>
          <SectionTitle>SẢN PHẨM MỚI</SectionTitle>
          <ProductScrollWithArrows>
            {topNew.map(product => (
              <CardComponent 
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
          </ProductScrollWithArrows>
        </WrapperSection>

        <WrapperSection>
          <SectionTitle>TOP BÁN CHẠY</SectionTitle>
          <ProductScrollWithArrows>
            {topSelling.map(product => (
              <CardComponent 
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
          </ProductScrollWithArrows>
        </WrapperSection>

          </>
        )}

        </div>
      </div>
    </Loading>
  )
}

export default HomePage


