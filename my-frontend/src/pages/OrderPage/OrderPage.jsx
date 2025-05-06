import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Form } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined } from '@ant-design/icons';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { WrapperStyleHeader, WrapperLeft, WrapperListOrder, WrapperItemOrder, WrapperCountOrder, WrapperRight, WrapperInfo, WrapperTotal, WrapperStyleHeaderDelivery } from './style';
import { WrapperInputNumber } from '../../components/ProductDetailComponent/style';
import { useDispatch, useSelector } from 'react-redux';
import { decreaseAmount, increaseAmount, removeAllOrderProduct, removeOrderProduct, selectedOrder } from '../../redux/slides/orderSlide';
import convertPrice from '../../utils';
import ModalComponent from '../../components/ModalComponent/ModalComponent';
import Loading from '../../components/LoadingComponent/Loading';
import InputComponent from '../../components/InputComponent/InputComponent';
import { useMutationHooks } from '../../hooks/useMutationHook';
import * as UserService from '../../service/UserService'
import * as message from '../../components/Message/Message'
import { updateUser } from '../../redux/slides/userSlide';
import { useNavigate } from 'react-router-dom';
import StepComponent from '../../components/StepComponent/StepComponent';


const OrderPage = () => {
  const order = useSelector((state) => state.order)
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [listChecked, setListChecked] = useState([])
  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false)
  const [stateUserDetails, setstateUserDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  })
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleRedirectProductDetail = (id) => {
    navigate(`/product-details/${id}`);
  }  

  const onChange = (e) => {
    if(listChecked.includes(e.target.value)) {
      const newListChecked = listChecked.filter((item) => item !== e.target.value)
      setListChecked(newListChecked)
    } else {
      setListChecked([...listChecked, e.target.value])
    }
  }
  
  const handleChangeCount = (type, idProduct, limited) => {
    if(type === 'increase') {
      if(!limited) {
        dispatch(increaseAmount({idProduct}))
      }
    } else {
      if(!limited) {
        dispatch(decreaseAmount({idProduct}))
      }
    }
  }

  const handleOnchangeCheckAll = (e) => {
    if(e.target.checked) {
      const newListChecked = []
      order?.orderItems?.forEach((item) => {
        newListChecked.push(item?.product)
      })
      setListChecked(newListChecked)
    } else {
      setListChecked([])
    }
  };

  useEffect(() => {
    dispatch(selectedOrder({listChecked}))
  }, [listChecked])

   useEffect(() => {
          form.setFieldsValue(stateUserDetails)
      }, [form, stateUserDetails])

  useEffect(() => {
    if(isOpenModalUpdateInfo) {
      setstateUserDetails({
        city: user?.city,
        name: user?.name,
        address: user?.address,
        phone: user?.phone
      })
    }
  }, [isOpenModalUpdateInfo])

  const handleChangeAddress = () => {
    setIsOpenModalUpdateInfo(true)
  }

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

  const deliveryPriceMemo = useMemo(() => {
    if(priceMemo >= 200000 && priceMemo < 500000) {
      return 10000
    } else if( priceMemo >= 500000 || order?.orderItemsSelected.length === 0){
      return 0
    } else {
      return 20000
    }
  }, [priceMemo])

  const totalPriceMemo = useMemo(() => {
    return Number(priceMemo) - Number(priceDiscountMemo) + Number(deliveryPriceMemo)
  }, [priceMemo, priceDiscountMemo, deliveryPriceMemo])

  const handleRemoveAllOrder = () => {
    if(listChecked?.length > 1) {
      dispatch(removeAllOrderProduct({listChecked}))
    }
  }

  const handleDeleteOrder = (idProduct) => {
    dispatch(removeOrderProduct({idProduct}))
    
  }

  const handleAddCard = () => {
    if(!order?.orderItemsSelected?.length) {
      message.error('Vui lòng chọn sản phẩm')
    }
    else if(!user?.phone || !user.address || !user.name || !user.city) {
      setIsOpenModalUpdateInfo(true)
    } else {
      navigate('/payment')
    }
  }



  const mutationUpdate = useMutationHooks(
      (data) => {
          const {id, token, ...rests} = data
          const res = UserService.updateUser(
              id, {...rests}, token
          )
          return res
      },
      
  )

  const {isPending, data} = mutationUpdate

  const handleCancelUpdate = () => {
    setstateUserDetails({
      name: '',
      email: '',
      phone: '',
      isAdmin: false
    })
    form.resetFields(false)
    setIsOpenModalUpdateInfo(false)
  }

  console.log('data', data)
  const handleUpdateInfoUser = () => {
    console.log('stateUserDetails', stateUserDetails)
    const {name, address, city, phone} = stateUserDetails
    if( name && address && city && phone ) {
      mutationUpdate.mutate({id: user?.id, token: user?.access_token, ...stateUserDetails}, {
        onSuccess: () => {
          dispatch(updateUser({name, address, city, phone}))
          setIsOpenModalUpdateInfo(false)
          
        }
      })
      
    }
  }

  const handleOnchangeDetails = (e) => {
    setstateUserDetails({
        ...stateUserDetails,
        [e.target.name]: e.target.value
    })
  }
  const itemsDelivery = [
    {
      title: '20.000 VND',
      description: 'Dưới 200.000 VND'
    },
    {
      title: '10.000 VND',
      description: 'Từ 200.000 VND đến dưới 500.000 VND',
    },
    {
      title: '0 VND',
      description: 'Trên 500.000 VND',
    }
  ]
  
  return (
    <div style={{ background: '#fff', width: '100%', minHeight: '100vh' }}>
    <div style={{ height: '1px', backgroundColor: '#eee' }}></div>

    <div style={{ width: '1270px', margin: '0 auto', padding: '24px 0' }}>
      <div style={{ fontSize: '14px', marginBottom: '8px', color: '#999', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ cursor: 'pointer', color: '#666' }} onClick={() => navigate('/')}>Trang chủ</span>
        <span>{'>'}</span>
        <span style={{ color: '#000' }}>Giỏ hàng</span>
      </div>
  
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>
        Giỏ hàng của bạn
      </h1>
  
  
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
          }}
        >
          {/* Gộp phần trái vào 1 khung trắng đẹp mắt */}
          <div
            style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              width: '68%',
            }}
          >
            <WrapperLeft style={{ width: '100%' }}>
              <WrapperStyleHeaderDelivery>
                <StepComponent 
                  items={itemsDelivery} 
                  current={
                    deliveryPriceMemo === 10000 ? 2 : 
                    deliveryPriceMemo === 20000 ? 1 : 
                    order?.orderItemsSelected.length === 0 ? 0 : 3
                  }
                />
              </WrapperStyleHeaderDelivery>
  
              <WrapperStyleHeader>
                <div className="left">
                  <Checkbox 
                    onChange={handleOnchangeCheckAll} 
                    checked={listChecked?.length === order?.orderItems?.length}
                  />
                  <span>Tất cả {order?.orderItems?.length} sản phẩm</span>
                </div>
                <div className="right">
                  <span style={{ width: 60 }}>Giá tiền</span>
                  <span style={{ width: 80 }}>Số lượng</span>
                  <span style={{ width: 100 }}>Thành tiền</span>
                  <DeleteOutlined 
                    className="delete-icon" 
                    onClick={handleRemoveAllOrder}
                  />
                </div>
              </WrapperStyleHeader>
  
              <WrapperListOrder>
                {order?.orderItems?.map((order) => (
                  <WrapperItemOrder key={order?.product}>
                    <div className="left">
                      <Checkbox 
                        onChange={onChange} 
                        value={order?.product} 
                        checked={listChecked.includes(order?.product)} 
                      />
                      <img 
                        src={order?.image} 
                        alt={order?.name} 
                      />
                      <div className="product-name" onClick={() => handleRedirectProductDetail(order?.product)}>
                        {order?.name}
                      </div>
                    </div>
  
                    <div className="right">
                      <span className="price">{convertPrice(order?.price)}</span>
  
                      <WrapperCountOrder>
                        <button onClick={() => handleChangeCount('decrease', order?.product, order?.amount === 1)}>
                          <MinusOutlined style={{ fontSize: 10 }} />
                        </button>
                        <WrapperInputNumber
                          value={order?.amount}
                          size="small"
                          min={1}
                          max={order?.countInStock}
                        />
                        <button onClick={() => handleChangeCount('increase', order?.product, order?.amount === order?.countInStock)}>
                          <PlusOutlined style={{ fontSize: 10 }} />
                        </button>
                      </WrapperCountOrder>
  
                      <span className="price">
                        {convertPrice(order?.price * order?.amount)}
                      </span>
  
                      <DeleteOutlined 
                        className="delete" 
                        onClick={() => handleDeleteOrder(order?.product)} 
                      />
                    </div>
                  </WrapperItemOrder>
                ))}
              </WrapperListOrder>
            </WrapperLeft>
          </div>


        <WrapperRight style={{ width: '32%' }}>
          <WrapperInfo>
            <div style={{ fontSize: '14px' }}>
              <span>Địa chỉ: </span>
              <span style={{ color: 'blue', fontWeight: 'bold' }}>
                {`${user?.address} ${user?.city}`}
              </span>
              <span
                onClick={handleChangeAddress}
                style={{ color: 'blue', cursor: 'pointer' }}
              >
                {' '}
                Thay đổi
              </span>
            </div>
          </WrapperInfo>

          <WrapperInfo>
            <div className="subtotal-info">
              <span>Tạm tính</span>
              <span>{convertPrice(priceMemo)}</span>
            </div>
            <div className="subtotal-info">
              <span>Giảm giá</span>
              <span className="discount">-{convertPrice(priceDiscountMemo)}</span>
            </div>
            <div className="subtotal-info">
              <span>Phí giao hàng</span>
              <span>{convertPrice(deliveryPriceMemo)}</span>
            </div>
          </WrapperInfo>

          <WrapperTotal>
            <span>
              Tổng tiền
              <span className="total-price">{convertPrice(totalPriceMemo)}</span>
            </span>
            <span className="vat-info">Đã bao gồm VAT nếu có</span>
          </WrapperTotal>

          <ButtonComponent
            onClick={() => handleAddCard()}
            size={40}
            styleButton={{
              background: '#000',
              height: '48px',
              width: '100%',
              border: 'none',
              borderRadius: '999px',
              marginTop: '16px',
            }}
            textButton="Mua hàng"
            styleTextButton={{
              color: '#fff',
              fontSize: '15px',
              fontWeight: '700',
            }}
          />
        </WrapperRight>
        
      </div>
    </div>
    <ModalComponent forceRender title="Cập nhật thông tin giao hàng " open={isOpenModalUpdateInfo} onCancel={handleCancelUpdate} onOk={handleUpdateInfoUser}>
        <Loading isPending={isPending}>
            <Form
              name="basic"
              labelCol={{
                  span: 4,
              }}
              wrapperCol={{
                  span: 20,
              }}
              // onFinish={onupdateUser}
              autoComplete="on"
              form={form}
          >
          <Form.Item
              label="Name"
              name="name"
              rules={[
              {
                  required: true,
                  message: 'Please input your name!',
              },
              ]}
          >
          <InputComponent value={stateUserDetails.name} onChange={handleOnchangeDetails} name="name"/>
          </Form.Item>

          <Form.Item
              label="City"
              name="city"
              rules={[
              {
                  required: true,
                  message: 'Please input your city!',
              },
              ]}
          >
          <InputComponent value={stateUserDetails.city} onChange={handleOnchangeDetails} name="city"/>
          </Form.Item>


          <Form.Item
              label="Phone"
              name="phone"
              rules={[
              {
                  required: true,
                  message: 'Please input your phone!',
              },
              ]}
          >
          <InputComponent value={stateUserDetails.phone} onChange={handleOnchangeDetails} name="phone"/>
          </Form.Item>

          <Form.Item
              label="Address"
              name="address"
              rules={[
              {
                  required: true,
                  message: 'Please input your address!',
              },
              ]}
          >
          <InputComponent value={stateUserDetails.address} onChange={handleOnchangeDetails} name="address"/>
          </Form.Item>

          </Form>
        </Loading>
    </ModalComponent>
  </div>

)
};   

export default OrderPage;
