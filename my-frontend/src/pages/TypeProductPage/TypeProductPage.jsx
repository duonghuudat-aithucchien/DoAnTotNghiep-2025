import React, { useEffect, useState } from 'react'
import NavbarComponent from '../../components/NavbarComponent/NavbarComponent'
import CardComponent from '../../components/CardComponent/CardComponent'
import { Col, Pagination, Row } from 'antd'
import { WrapperNavbar, WrapperProducts } from './style'
import { useLocation } from 'react-router-dom'
import * as ProductService from '../../service/ProductService'
import Loading from '../../components/LoadingComponent/Loading'
import { useSelector } from 'react-redux'
import { useDebounce } from '../../hooks/useDebounce'


const TypeProductPage = () => {
  const searchProduct = useSelector((state) => state?.product?.search)
  const searchDebounce = useDebounce(searchProduct, 500)
  const {state} = useLocation()
  const [products, setProducts] = useState([])
  const [pending, setPending] = useState(false)
  const [panigate, setPanigate] = useState({
    page: 0,
    limit: 10,
    total: 1
  })
  const fetchProductType = async (type, page, limit) => {
    setPending(true)
    const res = await ProductService.getProductType(type, page, limit)
      if(res?.status ==='OK') {
        setPending(false)
        setProducts(res?.data)
        setPanigate({...panigate, total: res?.totalPage})
      } else {

      }
  }


  useEffect(() => {
    if(state) {
      fetchProductType(state, panigate.page, panigate.limit)
    }
  }, [state, panigate.page, panigate.limit])

  const onChange = (current, pageSize) => {
    setPanigate({...panigate, page: current - 1, limit: pageSize})
  }
  return (
    <Loading isPending={pending}>
      <div style={{width: '100%', background: '#efefef', height: 'calc(100vh - 64px)'}}>
        <div style={{width: '1270px', margin: '0 auto', height: '100%'}}>
          <Row style={{ flexWrap: 'nowrap', paddingTop: '10px', height: 'calc(100% - 20px)'}}>
              <WrapperNavbar span={4}>
                  <NavbarComponent />
              </WrapperNavbar>
          <Col span={20} style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <WrapperProducts >
                {products?.filter((pro) => {
                  if(searchDebounce === '') {
                    return pro
                  } else if(pro?.name.toLowerCase()?.includes(searchDebounce?.toLocaleLowerCase())) {
                    return pro
                  }
                })?.map((product) => {
                  return (
                    <CardComponent 
                      key={product._id} 
                      countInstock={product.countInstock} 
                      description={product.description} 
                      image={product.image} name={product.name} 
                      price={product.price} 
                      rating={product.rating}
                      type={product.type}
                      selled={product.selled}
                      discount={product.discount}
                      id={product._id}
                    />
                  )
                })}                  
              </WrapperProducts>
              
              <Pagination defaultCurrent={panigate.page + 1} total={panigate.total} onChange={onChange} style={{textAlign: 'center', marginTop: '10px', justifyContent: 'center'}} />
          </Col>
          </Row>

        </div>
      </div>
    </Loading>
  )
}

export default TypeProductPage