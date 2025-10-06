
import React, { useEffect, useState, Suspense } from 'react'
import {
  WrapperButtonMore,
  WrapperProducts,
  WrapperSection,
  SectionTitle,
  WrapperProductsSearch,
} from './style'
import SliderComponent from '../../components/SliderComponent/SliderComponent'
import slider4 from '../../assets/images/slider4.svg'
import CardComponent from '../../components/CardComponent/CardComponent'
import * as ProductService from '../../service/ProductService'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import Loading from '../../components/LoadingComponent/Loading'
import { useDebounce } from '../../hooks/useDebounce'
import ProductScrollWithArrows from './ProductScrollWithArrows';
const FlashSaleCountdown1 = React.lazy(() => import('./FlashSaleCountdown'));

const HomePage = () => {
  const searchProduct = useSelector((state) => state?.product?.search)
  const searchDebounce = useDebounce(searchProduct, 500)
  const [limit, setLimit] = useState(5)
  const [typeProducts, setTypeProducts] = useState([])
  const [productLimits, setProductLimits] = useState({})
  const [productsByType, setProductsByType] = useState({})
  const [loadingTypes, setLoadingTypes] = useState({})
  const [allLoaded, setAllLoaded] = useState({})
  const [searchResults, setSearchResults] = useState([])
  const [searchAllLoaded, setSearchAllLoaded] = useState(false)
  const [fetchKey, setFetchKey] = useState(0) // Trigger reload products
  const [topSelling, setTopSelling] = useState([])
  const [topNew, setTopNew] = useState([])
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
        initialLimits[type] = 6
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
        // const res = await ProductService.getProductByType(type, 9999)
        const res = await ProductService.getProductByType(type, productLimits[type] || 6)

        setLoadingTypes(prev => ({ ...prev, [type]: false }))

        const fullProducts = res?.data || []

        setProductsByType(prev => ({
          ...prev,
          [type]: fullProducts
        }))

        setAllLoaded(prev => {
          const limit = productLimits[type] || 6
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
      setSearchResults(searchData.data.slice(0, 6))
      setSearchAllLoaded(searchData.data.length <= 6)
    } else {
      setSearchResults([])
      setSearchAllLoaded(true)
    }
  }, [searchData])

  // const handleShowMoreSearch = () => {
  //   if (searchData?.data) {
  //     const newLimit = searchResults.length + 6
  //     const newResults = searchData.data.slice(0, newLimit)
  //     setSearchResults(newResults)
  //     setSearchAllLoaded(newLimit >= searchData.data.length)
  //   }
  // }
const handleShowMoreSearch = () => {
  if (searchData?.data) {
    const newLimit = searchResults.length + 6;
    const newResults = searchData.data.slice(0, newLimit);

    setSearchResults(prev => {
      const updated = [...newResults];
      return updated;
    });

    setSearchAllLoaded(newLimit >= searchData.data.length);
  }
};



console.log('Search length:', searchData?.data?.length)
console.log('Current displayed:', searchResults.length)

  
  return (
    <Loading isPending={(!!searchDebounce && (isPending || isFetching)) || Object.values(loadingTypes).some(v => v)}>
      <div style={{ width: '1270px', margin: '0 auto' }}></div>
      <div className='body' style={{ width: '100%', backgroundColor: '#fff' }}>
        <div id="container" style={{
          paddingBottom: '60px',
          maxWidth: '1270px',
          width: '100%',
          margin: '0 auto',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}>
          <SliderComponent arrImages={[slider4, slider4, slider4]} />
         <WrapperSection>
            <SectionTitle>FLASH SALE</SectionTitle>
            {/* Sử dụng Suspense để bọc FlashSaleCountdown */}
            <Suspense fallback={<div>Đang tải Flash Sale...</div>}>
              <FlashSaleCountdown1 endTime="2025-05-27T23:59:59" />
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

          
        {searchDebounce ? (
          <WrapperSection>
            <SectionTitle>KẾT QUẢ TÌM KIẾM</SectionTitle>

            {searchResults.length > 0 ? (
              <>
                <WrapperProductsSearch>
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
                </WrapperProductsSearch>

                {!searchAllLoaded && (
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <WrapperButtonMore
                      textButton="Xem thêm"
                      type="outline"
                      onClick={handleShowMoreSearch}
                    />
                  </div>
                )}
              </>
            ) : (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                fontSize: '16px',
                color: '#888',
                fontStyle: 'italic'
              }}>
                Không có sản phẩm phù hợp với từ khóa tìm kiếm.
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


