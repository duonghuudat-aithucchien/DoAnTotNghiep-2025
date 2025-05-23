

import React, { useEffect, useMemo, useState } from 'react' 
import {Col, Row, Image, Rate} from 'antd'
import imageProductSmall from '../../assets/images/image7.png'
import { WrapperStyleImageSmall, WrapperStyleColImage, WrapperStyleNameProduct, WrapperStyleTextSell, WrapperPriceProduct, WrapperPriceTextProduct, WrapperAddressProduct, WrapperQualityProduct, WrapperInputNumber } from './style'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import * as ProductService from '../../service/ProductService'
import { useQuery } from '@tanstack/react-query'
import Loading from '../LoadingComponent/Loading'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { addOrderProduct, resetOrder } from '../../redux/slides/orderSlide'
import convertPrice from '../../utils'
import * as message from '../../components/Message/Message'
import LikeButtonComponent from '../LikeButtonComponent/LikeButtonComponent'
import CommentFB from '../LikeButtonComponent/CommentFB'

const ProductDetailComponent = ({idProduct}) => {
    const [numProduct, setNumProduct] = useState(1)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const user = useSelector((state) => state.user)
    const order = useSelector((state) => state.order)
    const [errorLimitOrder, setErrorLimitOrder] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null);

          
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const onChange = (value) => {
        setNumProduct(Number(value));
    };

    const fetchGetDetailsProduct = async (context) => {     
        const id = context?.queryKey && context?.queryKey[1]
        if(id) {
            const res = await ProductService.getDetailsProduct(id);
            return res.data
        }               
    };

    useEffect(() => {
        const orderRedux = order?.orderItems?.find((item) => item.product === productDetails?._id)
        if((orderRedux?.amount + numProduct) <= orderRedux?.countInStock || !orderRedux) {
            setErrorLimitOrder(false)
        } else if(productDetails?.countInStock === 0) {
            setErrorLimitOrder(true)
        }
    }, [numProduct])

    useEffect(() => {
        if(order.isSuccessOrder) {
            message.success('Thêm sản phẩm vào giỏ hàng thành công')
        }
        return () => {
            dispatch(resetOrder)
        }
    },[order.isSuccessOrder])

    const handleChangeCount = (type, limited) => {
        if(type === 'increase') {
            if(!limited) {
                setNumProduct(numProduct + 1)
            }
        } else {
            if(!limited) {
                setNumProduct(numProduct - 1)
            }
        }
    }

    const { isPending, data: productDetails } = useQuery({
        queryKey: ['product-details', idProduct],
        queryFn: fetchGetDetailsProduct,
        enabled: !!idProduct,
    });

    // const handleAddOrderProduct = () => {
    //     if(!user?.id) {
    //         navigate('/sign-in', {state: location?.pathname})
    //     } else {
    //         const orderRedux = order?.orderItems?.find((item) => item.product === productDetails?._id)
    //         if((orderRedux?.amount + numProduct) <= orderRedux?.countInStock || !orderRedux) {
    //             dispatch(addOrderProduct({
    //                 orderItem: {
    //                     name: productDetails?.name,
    //                     amount: numProduct,
    //                     image: productDetails?.image,
    //                     price: productDetails?.price,
    //                     product: productDetails?._id,                        
    //                     discount: productDetails?.discount,
    //                     countInStock: productDetails?.countInStock,
    //                     description: productDetails?.description,
    //                     colors: productDetails?.colors,
    //                     sizes: productDetails?.sizes,
    //                 }
    //             }))
    //         } else {
    //             setErrorLimitOrder(true)
    //         }
    //     }
    // }

    const handleAddOrderProduct = () => {
        if (!user?.id) {
            navigate('/sign-in', { state: location?.pathname });
        } else {
            const orderRedux = order?.orderItems?.find(
                (item) =>
                    item.product === productDetails?._id &&
                    item.sizes === selectedSize &&
                    item.colors === selectedColor // So sánh cả size và color
            );
    
            if (
                (orderRedux?.amount + numProduct) <= orderRedux?.countInStock ||
                !orderRedux
            ) {
                if (!selectedSize || !selectedColor) {
                    message.error("Vui lòng chọn kích thước và màu sắc!");
                    return;
                }
    
                dispatch(
                    addOrderProduct({
                        orderItem: {
                            name: productDetails?.name,
                            amount: numProduct,
                            image: productDetails?.image,
                            price: productDetails?.price,
                            product: productDetails?._id,
                            discount: productDetails?.discount,
                            countInStock: productDetails?.countInStock,
                            description: productDetails?.description,
                            sizes: selectedSize, // Chỉ gửi kích thước đã chọn
                            colors: selectedColor, // Chỉ gửi màu sắc đã chọn
                        },
                    })
                );
            } else {
                setErrorLimitOrder(true);
            }
        }
    };

    const priceMemo = useMemo(() => {
        const result = order?.orderItemsSelected?.reduce((total, cur) => {
          return total + ((cur.price * cur.amount))
        },0)
        return result
      }, [order])
    
      const priceDiscountMemo = useMemo(() => {
        const result = order?.orderItemsSelected?.reduce((total, cur) => {
          return total + ((cur.price * cur.amount * cur.discount)/100)
        },0)
        if(Number(result)) {
          return result
        }
        return 0
      }, [order])
    
    
      const totalPriceMemo = useMemo(() => {
        return Number(priceMemo) - Number(priceDiscountMemo)
      }, [priceMemo, priceDiscountMemo])

        useEffect(() => {
        if (productDetails?.image) {
          setSelectedImage(productDetails.image);
        }
      }, [productDetails]); 

     // Chuyển đổi an toàn chuỗi thành mảng
    // const parseToArray = (field) => {
    //     if (Array.isArray(field)) return field;
    //     if (typeof field === "string") return field.split(",").map((item) => item.trim());
    //     return [];
    // };
    const parseToArray = (field) => {
        if (Array.isArray(field)) return field.filter((item) => item.trim() !== "");
        if (typeof field === "string") return field.split(",").map((item) => item.trim()).filter((item) => item !== "");
        return [];
      };
  
    const colors = parseToArray(productDetails?.colors);
    const sizes = parseToArray(productDetails?.sizes);
    ;
      

    return (
        <Loading isPending={isPending}>
            <Row style={{padding: '16px', background: '#fff', borderRadius: '4px'}}>
                {/* <Col span={10} style={{borderRight:'1px solid #e5e5e5', paddingRight: '8px'}}>
                    <Image src={productDetails?.image} alt="image-product" preview={false} style={{ borderRadius: '8px', objectFit: 'contain', width: '100%' }}/>
                    <Row style={{paddingTop: '10px', justifyContent: 'space-between'}}>
                        {[...Array(6)].map((_, idx) => (
                            <WrapperStyleColImage span={4} key={idx}>
                                <WrapperStyleImageSmall src={imageProductSmall} alt="image-small" preview={false}/>
                            </WrapperStyleColImage>
                        ))}
                    </Row>
                </Col> */}

<Col span={10}>
  <Row style={{ display: 'flex', gap: '24px' }}>
    {/* Ảnh phụ */}
    <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[productDetails?.image, ...(productDetails?.subImages || [])].map((img, idx) => (
        <div
          key={idx}
          onClick={() => setSelectedImage(img)}
          style={{
            border: selectedImage === img ? '2px solid #000' : '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '4px',
            cursor: 'pointer',
          }}
        >
          <Image
            src={img}
            alt={`thumb-${idx}`}
            preview={true}
            style={{ borderRadius: '4px', width: '100%', objectFit: 'cover' }}
          />
        </div>
      ))}
    </div>

    {/* Ảnh chính */}
    <div style={{ flex: 1 }}>
      <Image
        src={selectedImage || productDetails?.image}
        alt="main-product"
        preview={true}
        style={{
          borderRadius: '12px',
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          backgroundColor: '#f9f9f9',
          padding: '12px',
        }}
      />
    </div>
  </Row>
</Col>

                <Col span={14} style={{paddingLeft:'10px'}}>
                    <WrapperStyleNameProduct>{productDetails?.name}</WrapperStyleNameProduct>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
                        <Rate allowHalf value={productDetails?.rating} disabled style={{ fontSize: '16px' }} />
                        <WrapperStyleTextSell>| Đã bán: {productDetails?.selled}</WrapperStyleTextSell>
                    </div>

                    <WrapperPriceProduct style={{ margin: '16px 0' }}>
                        <WrapperPriceTextProduct style={{ fontSize: '28px', color: '#ff424e', fontWeight: 600 }}>
                            {convertPrice((productDetails?.price) - (productDetails?.discount*productDetails?.price)/100)}
                            {/* {convertPrice(totalPriceMemo)} */}
                        </WrapperPriceTextProduct>
                        {productDetails?.discount && (
                            <>
                                <span style={{ marginLeft: '12px', textDecoration: 'line-through', color: '#ccc', fontSize: '18px' }}>
                                {convertPrice(productDetails?.price?.toLocaleString())} </span>
                                <span style={{ marginLeft: '8px', color: '#f5222d', fontSize: '16px' }}>{productDetails?.discount} %</span>
                            </>
                        )}
                    </WrapperPriceProduct>

                    <p style={{ fontSize: '15px', color: '#333' }}>{productDetails?.description}</p>

                    {/* {Array.isArray(productDetails?.colors) && productDetails.colors.map((color) => (
                        <div
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: color,
                            border: selectedColor === color ? '2px solid #000' : '1px solid #ccc',
                            cursor: 'pointer'
                            }}
                        />
                    ))}



                    {Array.isArray(productDetails?.sizes) && productDetails.sizes.map(size => (
                        <div
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: selectedSize === size ? '2px solid #000' : '1px solid #ccc',
                            backgroundColor: selectedSize === size ? '#000' : '#fff',
                            color: selectedSize === size ? '#fff' : '#000',
                            fontWeight: 500,
                            cursor: 'pointer'
                            }}
                        >
                            {size}
                        </div>
                    ))} */}

{/* Màu sắc */}
{colors.length > 0 && (
  <div style={{ margin: '24px 0' }}>
    <div style={{ fontWeight: 500, marginBottom: 8 }}>Chọn màu sắc</div>
    <div style={{ display: 'flex', gap: 12 }}>
      {colors.map((color) => (
        <div
          key={color}
          onClick={() => setSelectedColor(color)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: color,
            border: selectedColor === color ? '2px solid #000' : '1px solid #ccc',
            cursor: 'pointer',
            boxShadow: selectedColor === color ? '0 0 0 2px #00000055' : 'none',
            transition: 'all 0.2s ease',
          }}
        />
      ))}
    </div>
  </div>
)}

{/* Kích thước */}
{sizes.length > 0 && (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontWeight: 500, marginBottom: 8 }}>Chọn kích thước</div>
    <div style={{ display: 'flex', gap: 12 }}>
      {sizes.map((size) => (
        <div
          key={size}
          onClick={() => setSelectedSize(size)}
          style={{
            padding: '8px 16px',
            borderRadius: '24px',
            border: selectedSize === size ? '2px solid #000' : '1px solid #ccc',
            backgroundColor: selectedSize === size ? '#000' : '#fff',
            color: selectedSize === size ? '#fff' : '#000',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {size}
        </div>
      ))}
    </div>
  </div>
)}


                    <div style={{margin: '20px 0', padding:'10px 0', borderTop:'1px solid #e5e5e5', borderBottom:'1px solid #e5e5e5'}}>
                        <div style={{marginBottom: '10px'}}>Số lượng</div>
                        <WrapperQualityProduct>
                            <button
                                style={{ border: 'none', background: 'transparent', cursor: numProduct > 1 ? 'pointer' : 'not-allowed' }}
                                onClick={() => handleChangeCount('decrease', numProduct === 1)}
                                disabled={numProduct <= 1}
                            >
                                <MinusOutlined style={{ color: '#000', fontSize: '20px' }} />
                            </button>
                            <WrapperInputNumber onChange={onChange} defaultValue={1} min={1} max={productDetails?.countInStock} value={numProduct} size="small" />
                            <button style={{border:'none', background: 'transparent', cursor: numProduct >= productDetails?.countInStock ? 'not-allowed' : 'pointer'}} onClick={() => handleChangeCount('increase', numProduct === productDetails?.countInStock)}>
                                <PlusOutlined style={{color: '#000', fontSize: '20px'}}/>
                            </button>
                        </WrapperQualityProduct>
                    </div>

                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div>
                            <ButtonComponent
                                size={40}
                                styleButton={{background: '#000000', height:'48px', width: '220px', border:'none', borderRadius: '4px'}}
                                onClick={handleAddOrderProduct}
                                textButton={'Thêm vào giỏ hàng'}
                                styleTextButton={{color: '#fff',  fontSize:'15px', fontWeight: '700'}}
                            />
                            {errorLimitOrder && <div style={{ color: 'red' }}> Sản phẩm đã hết hàng</div>}
                        </div>
                    </div>
                </Col>

                {/* <CommentFB dataHref="https://developers.facebook.com/docs/plugins/comments#configurator" width="1270" /> */}
            </Row>
        </Loading>
    )
}

export default ProductDetailComponent
