import React, { useEffect, useState } from 'react'
import NavbarComponent from '../../components/NavbarComponent/NavbarComponent'
import CardComponent from '../../components/CardComponent/CardComponent'
import { Col, Pagination, Row, Select, Typography } from 'antd'
import { WrapperNavbar, WrapperProducts, WrapperHeader, WrapperTopBar } from './style'
import { useLocation } from 'react-router-dom'
import * as ProductService from '../../service/ProductService'
import Loading from '../../components/LoadingComponent/Loading'
import { useSelector } from 'react-redux'
import { useDebounce } from '../../hooks/useDebounce'

const { Title } = Typography
const { Option } = Select

const TypeProductPage = () => {
  const searchProduct = useSelector((state) => state?.product?.search)
  const searchDebounce = useDebounce(searchProduct, 500)
  const { state } = useLocation()

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
    if (res?.status === 'OK') {
      setPending(false)
      setProducts(res?.data)
      setPanigate({ ...panigate, total: res?.totalPage })
    }
  }

  useEffect(() => {
    if (state) {
      fetchProductType(state, panigate.page, panigate.limit)
    }
  }, [state, panigate.page, panigate.limit])

  const onChange = (current, pageSize) => {
    setPanigate({ ...panigate, page: current - 1, limit: pageSize })
  }

  return (
    <Loading isPending={pending}>
      <div style={{ width: '100%', background: '#f9f9f9', padding: '20px 0' }}>
        <div style={{ maxWidth: '1270px', margin: '0 auto', padding: '0 16px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={6} lg={5}>
              <WrapperNavbar>
                <NavbarComponent />
              </WrapperNavbar>
            </Col>

            <Col xs={24} md={18} lg={19} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Header Row */}
              <WrapperHeader>
                <Title level={3} style={{ margin: 0 }}>{state || 'Category'}</Title>
                <WrapperTopBar>
                  <span>Showing 1-{products.length} of {panigate.total * panigate.limit} Products</span>
                  <Select defaultValue="Most Popular" size="small">
                    <Option value="popular">Most Popular</Option>
                    <Option value="price_low">Price: Low to High</Option>
                    <Option value="price_high">Price: High to Low</Option>
                  </Select>
                </WrapperTopBar>
              </WrapperHeader>

              {/* Product Grid */}
              <WrapperProducts>
                <Row gutter={[16, 24]}>
                  {products?.filter((pro) => {
                    return searchDebounce === '' || pro?.name.toLowerCase().includes(searchDebounce.toLowerCase())
                  }).map((product) => (
                    <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
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
                    </Col>
                  ))}
                </Row>
              </WrapperProducts>

              {/* Pagination */}
              <Pagination
                current={panigate.page + 1}
                total={panigate.total * panigate.limit}
                pageSize={panigate.limit}
                onChange={onChange}
                style={{ textAlign: 'center', marginTop: '30px' }}
              />
            </Col>
          </Row>
        </div>
      </div>
    </Loading>
  )
}

export default TypeProductPage
