import React, { useEffect, useMemo, useState } from 'react';
import { Form, Radio } from 'antd';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { WrapperStyleHeader, WrapperLeft, WrapperListOrder, WrapperItemOrder, WrapperPriceDiscount, WrapperCountOrder, WrapperRight, WrapperInfo, WrapperTotal } from './style';
import { useDispatch, useSelector } from 'react-redux';
import convertPrice from '../../utils';
import ModalComponent from '../../components/ModalComponent/ModalComponent';
import Loading from '../../components/LoadingComponent/Loading';
import InputComponent from '../../components/InputComponent/InputComponent';
import { useMutationHooks } from '../../hooks/useMutationHook';
import * as UserService from '../../service/UserService'
import * as message from '../../components/Message/Message'
import { updateUser } from '../../redux/slides/userSlide';
import * as OrderService from '../../service/OrderService'
import { WrapperRadio } from './style';
import { Label } from './style';
import { useNavigate } from 'react-router-dom';
import { removeAllOrderProduct } from '../../redux/slides/orderSlide';
// import { PayPalButton } from "react-paypal-button-v2";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import * as PaymentService from '../../service/PaymentService'

const PaymentPage = () => {
  const order = useSelector((state) => state.order)
  const user = useSelector((state) => state.user)

  const dispatch = useDispatch()
  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false)
  const navigate = useNavigate()
  const [sdkReady, setSdkReady] = useState(false)
  const [clientId, setClientId] = useState();


  const [payment, setPayment] = useState('later_money');  
  const [delivery, setDelivery] = useState('fast')

  const [stateUserDetails, setstateUserDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  })
  const [form] = Form.useForm()



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

  const handleAddOrder = () => {
    if(user?.access_token && order?.orderItemsSelected && user?.name && user?.address && user?.phone && user?.city && priceMemo && user?.id) {
      mutationAddOrder.mutate(
        {
          token: user?.access_token,
          orderItems: order?.orderItemsSelected,
          fullName: user?.name,
          address: user?.address,
          phone: user?.phone,
          city: user?.city,
          paymentMethod: payment,
          itemsPrice: priceMemo,
          shippingPrice: deliveryPriceMemo,
          totalPrice: totalPriceMemo,
          user: user?.id,
          isPaid: false,
          email: user?.email,
        },
        
      );
      // mutationAddOrder.mutate({
      //   token: user?.access_token,
      //   orderItems: order?.orderItemsSelected.map(item => ({
      //     ...item,
      //     product: String(item.product)
      //   })),
      //   shippingAddress: {
      //     fullName: user?.name,
      //     address: user?.address,
      //     city: user?.city,
      //     phone: user?.phone,
      //   },
      //   paymentMethod: payment,
      //   itemsPrice: priceMemo,
      //   shippingPrice: deliveryPriceMemo,
      //   totalPrice: totalPriceMemo,
      //   user: user?.id,
      //   isPaid: false,
      //   email: user?.email,
      // })
      
    }
  };
  



  const mutationUpdate = useMutationHooks(
      (data) => {
          const {id, token, ...rests} = data
          const res = UserService.updateUser(
              id, {...rests}, token
          )
          return res
      },
      
  )



  const mutationAddOrder = useMutationHooks(
    (data) => {
        const { token, ...rests} = data
        const res = OrderService.createOrder(
            {...rests}, token
        )
        return res
    },
    
)

  const {isPending, data} = mutationUpdate
  const {data: dataAdd, isPending: isPendingAddOrder, isSuccess, isError} = mutationAddOrder

  useEffect(() => {
    if (isSuccess && dataAdd?.status === 'OK') {
      const arrayOrdered = []
      order?.orderItemsSelected?.forEach(element => {
        arrayOrdered.push(element.product)
      })
      dispatch(removeAllOrderProduct({listChecked: arrayOrdered}))
      message.success('Đặt hàng thành công')
      navigate('/orderSuccess', {
        state: {
          delivery,
          payment,
          orders: order?.orderItemsSelected,
          totalPriceMemo: totalPriceMemo
        }
      })
    } else if (isError) {
        message.error()
    }
  }, [isSuccess, isError])

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

  const onSuccessPaypal = (details, data) => {
    mutationAddOrder.mutate(
      {
        token: user?.access_token,
        orderItems: order?.orderItemsSelected,
        fullName: user?.name,
        address: user?.address,
        phone: user?.phone,
        city: user?.city,
        paymentMethod: payment,
        itemsPrice: priceMemo,
        shippingPrice: deliveryPriceMemo,
        totalPrice: totalPriceMemo,
        user: user?.id,
        isPaid: true,
        paidAt: details.update_time,
        email: user?.email,
      },
    );
    // mutationAddOrder.mutate({
    //   token: user?.access_token,
    //   orderItems: order?.orderItemsSelected.map(item => ({
    //     ...item,
    //     product: String(item.product)
    //   })),
    //   shippingAddress: {
    //     fullName: user?.name,
    //     address: user?.address,
    //     city: user?.city,
    //     phone: user?.phone,
    //   },
    //   paymentMethod: payment,
    //   itemsPrice: priceMemo,
    //   shippingPrice: deliveryPriceMemo,
    //   totalPrice: totalPriceMemo,
    //   user: user?.id,
    //   isPaid: true,
    //   paidAt: details.update_time,
    // })
    
  }

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

  const handleDelivery = (e) => {
    setDelivery(e.target.value)
  }

  const handlePayment = (e) => {
    setPayment(e.target.value)
    console.log("Phương thức thanh toán:", e.target.value)

  }

  const addPaypalScript = async () => {
    // const {data} = await PaymentService.getConfig()
    // console.log('PayPal Client ID:', data); // Kiểm tra giá trị Client ID
    // setClientId(data); 
    // const script = document.createElement('script')
    // script.type = 'text/javascript'
    // script.src = `https://www.paypal.com/sdk/js?client-id=${data}`
    // script.async = true
    // script.onload = () => {
    //   setSdkReady(true)
    // }
    // document.body.appendChild(script)
    const res = await PaymentService.getConfig()
    // console.log('PayPal config response:', res) 
    setClientId(res.data)
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://www.paypal.com/sdk/js?client-id=${res.data}&currency=USD`
    script.async = true
    script.onload = () => {
      setSdkReady(true)
    }
    document.body.appendChild(script)
  }

  // useEffect(() => {
  //   if(!window.paypal) {
  //     addPaypalScript()
  //   } else {
  //     setSdkReady(true)
  //   }
  // }, [])
  useEffect(() => {
    if (!window.paypal) {
      addPaypalScript()
    } else {
      setSdkReady(true)
    }
  
    return () => {
      const script = document.querySelector(`script[src*="paypal.com/sdk/js"]`)
      if (script) script.remove()
    }
  }, [])
  

  // const totalPriceInUSD = parseFloat((totalPriceMemo / 23000).toFixed(2));
  return (
  <div style={{ background: '#f5f5fa', width: '100%', height: '100vh' }}>
    <Loading isPending={isPendingAddOrder}>
        <div style={{ height: '100%', width: '1270px', margin: '0 auto' }}>
        <h3>Phương thức thanh toán</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
        <WrapperLeft>
            <WrapperInfo>
                <div>
                <Label>Chọn phương thức giao hàng</Label>
                <WrapperRadio onChange={handleDelivery} value={delivery}>
                    <Radio value="fast">
                    <span style={{ color: '#ea8500', fontWeight: 'bold' }}>FAST</span> Giao hàng tiết kiệm
                    </Radio>
                    <Radio value="gojek">
                    <span style={{ color: '#ea8500', fontWeight: 'bold' }}>GOJEK</span> Giao hàng tiết kiệm
                    </Radio>
                </WrapperRadio>
                </div>
            </WrapperInfo>

            <WrapperInfo>
                <div>
                <Label>Chọn phương thức thanh toán</Label>
                <WrapperRadio onChange={handlePayment} value={payment}>
                    <Radio value="later_money">
                    Thanh toán tiền mặt khi nhận hàng
                    </Radio>
                    <Radio value="paypal">
                    Thanh toán bằng ví điện tử paypal
                    </Radio>
                </WrapperRadio>
                </div>
            </WrapperInfo>
            </WrapperLeft>



            <WrapperRight>
            <WrapperInfo>
                <div style={{fontSize: '14px'}}>
                <span>Địa chỉ:</span>
                <span style={{color: 'blue', fontWeight: 'bold'}}>{`${user?.address} ${user?.city}`}</span>
                <span onClick={handleChangeAddress} style={{color: 'blue', cursor: 'pointer'}}>Thay đổi</span>
                </div>
            </WrapperInfo>
            <div style={{ width: '100%' }}>
                <WrapperInfo>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Tạm tính</span>
                    <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>{convertPrice(priceMemo)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Giảm giá</span>
                    <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>{convertPrice(priceDiscountMemo)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Phí giao hàng</span>
                    <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>{convertPrice(deliveryPriceMemo)}</span>
                </div>
                </WrapperInfo>
                
                <WrapperTotal>
                <span>Tổng tiền</span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'rgb(254, 56, 52)', fontSize: '24px', fontWeight: 'bold' }}>{convertPrice(totalPriceMemo)}</span>
                    <span style={{ color: '#000', fontSize: '11px' }}>Đã bao gồm VAT nếu có</span>
                </span>
                </WrapperTotal>
            </div>
            {/* //thanh toán paypal */}
            {payment === 'paypal' && sdkReady ? (
              <div style={{width: '320px'}}>                
                <PayPalScriptProvider
                options={{
                    "client-id": clientId, 
                    currency: "USD",
                }}
                >
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: (Math.round(totalPriceMemo / 25000)).toFixed(2),
                            currency_code: 'USD',
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(function (details) {
                      onSuccessPaypal(details); // Gọi callback sau khi thanh toán thành công
                    });
                  }}
                  onError={() => {
                    alert('Thanh toán thất bại!');
                  }}
                />
                </PayPalScriptProvider>
              </div>
            ) : (
              <ButtonComponent
                onClick={() => handleAddOrder()}
                size={40}
                styleButton={{
                background: 'rgb(255,57,69)',
                height: '48px',
                width: '320px',
                border: 'none',
                borderRadius:'4px'
                }}
                textButton={'Đặt hàng'}
                styleTextButton={{color: '#fff', fontSize: '15px', fontWeight: '700'}}
                >
            </ButtonComponent>

            )}
            
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
    </Loading>
  </div>

)
};   

export default PaymentPage;
