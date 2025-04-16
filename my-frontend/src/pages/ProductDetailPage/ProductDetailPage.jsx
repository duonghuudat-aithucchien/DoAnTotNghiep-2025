import React from 'react'
import ProductDetailComponent from '../../components/ProductDetailComponent/ProductDetailComponent'
import { useNavigate, useParams } from 'react-router-dom'

const ProductDetailPage = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  return (
    <div style={{width: '100%', background: '#efefef'}}>
      <div style={{ width: '1270px', height: '100%', margin: '0 auto'}}>
        <h5 style={{fontSize: '20px'}}>
          <span style={{cursor:'pointer', fontWeight: 'bold'}} onClick={() => {navigate('/')}}>
             Trang chủ
          </span>
             - Chi tiết sản phẩm
        </h5>
            <ProductDetailComponent idProduct={id}/>
      </div>
    </div>
  )
}

export default ProductDetailPage