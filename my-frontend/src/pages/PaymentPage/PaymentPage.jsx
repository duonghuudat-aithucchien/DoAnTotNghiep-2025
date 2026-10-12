import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Radio, Input, Button, Modal, Tag } from 'antd';
import {
  GiftOutlined,
  QrcodeOutlined,
  CopyOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { WrapperLeft, WrapperRight, WrapperInfo, WrapperTotal } from './style';
import { useDispatch, useSelector } from 'react-redux';
import convertPrice, { isJsonString } from '../../utils';
import { jwtDecode } from 'jwt-decode';
import ModalComponent from '../../components/ModalComponent/ModalComponent';
import Loading from '../../components/LoadingComponent/Loading';
import { useMutationHooks } from '../../hooks/useMutationHook';
import * as UserService from '../../service/UserService';
import * as message from '../../components/Message/Message';
import { updateUser } from '../../redux/slides/userSlide';
import * as OrderService from '../../service/OrderService';
import { WrapperRadio, Label } from './style';
import { useNavigate, useLocation } from 'react-router-dom';
import { removeAllOrderProduct } from '../../redux/slides/orderSlide';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import * as PaymentService from '../../service/PaymentService';
import * as VoucherService from '../../service/VoucherService';

const PAYPAL_VND_PER_USD = Number(process.env.REACT_APP_PAYPAL_VND_PER_USD || 25000);

const PaymentPage = () => {
  const order = useSelector((state) => state.order);
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [sdkReady, setSdkReady] = useState(false);
  const [clientId, setClientId] = useState();

  // Helper an toàn lấy token và userId
  const getAuthTokenAndId = () => {
    let token = user?.access_token;
    let userId = user?.id;

    if (!token || !userId) {
      try {
        let storageData = localStorage.getItem('access_token');
        if (storageData) {
          if (isJsonString(storageData)) {
            token = JSON.parse(storageData);
          } else {
            token = storageData;
          }
          const decoded = jwtDecode(token);
          if (decoded?.id) {
            userId = decoded.id;
          }
        }
      } catch (e) {
        console.error('Error reading token:', e);
      }
    }
    return { token, userId };
  };

  const [payment, setPayment] = useState('later_money');
  const [delivery, setDelivery] = useState('fast');

  // Voucher states
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [isOpenModalVoucher, setIsOpenModalVoucher] = useState(false);
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  // VietQR states
  const [isOpenModalVietQR, setIsOpenModalVietQR] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);
  const [vietQRConfig, setVietQRConfig] = useState(null);
  const paypalDatabaseOrderId = useRef(null);

  const [stateUserDetails, setstateUserDetails] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpenModalUpdateInfo) {
      const initialDetails = {
        city: user?.city || '',
        name: user?.name || '',
        address: user?.address || '',
        phone: user?.phone || '',
      };
      setstateUserDetails(initialDetails);
      form.setFieldsValue(initialDetails);
    }
  }, [isOpenModalUpdateInfo, user, form]);

  useEffect(() => {
    PaymentService.getVietQRConfig()
      .then((response) => {
        if (response?.status === 'OK' && response.data?.accountNo) setVietQRConfig(response.data);
      })
      .catch(() => setVietQRConfig(null));
  }, []);

  // Lấy danh sách voucher khả dụng
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await VoucherService.getAvailableVouchers();
        if (res?.status === 'OK') {
          setAvailableVouchers(res?.data || []);
        }
      } catch (err) {
        console.error('Lỗi lấy voucher:', err);
      }
    };
    fetchVouchers();
  }, []);

  const handleChangeAddress = () => {
    setIsOpenModalUpdateInfo(true);
  };

  const priceMemo = useMemo(() => {
    const result = order?.orderItemsSelected?.reduce((total, cur) => {
      return total + cur.price * cur.amount;
    }, 0);
    return result || 0;
  }, [order]);

  const priceDiscountMemo = useMemo(() => {
    const result = order?.orderItemsSelected?.reduce((total, cur) => {
      return total + (cur.price * cur.amount * (cur.discount || 0)) / 100;
    }, 0);
    return Number(result) || 0;
  }, [order]);

  const deliveryPriceMemo = useMemo(() => {
    if (priceMemo >= 200000 && priceMemo < 500000) {
      return 10000;
    } else if (priceMemo >= 500000 || order?.orderItemsSelected?.length === 0) {
      return 0;
    } else {
      return 20000;
    }
  }, [priceMemo, order?.orderItemsSelected?.length]);

  const totalPriceMemo = useMemo(() => {
    const discountVoucher = appliedVoucher?.discountAmount || 0;
    const total =
      Number(priceMemo) -
      Number(priceDiscountMemo) -
      Number(discountVoucher) +
      Number(deliveryPriceMemo);
    return Math.max(0, total);
  }, [priceMemo, priceDiscountMemo, appliedVoucher, deliveryPriceMemo]);

  // Áp dụng voucher
  const handleApplyVoucher = async (codeToApply) => {
    const code = codeToApply || voucherInput;
    if (!code) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }
    try {
      setLoadingVoucher(true);
      const res = await VoucherService.applyVoucher(code, priceMemo);
      if (res?.status === 'OK') {
        setAppliedVoucher(res.data);
        message.success(
          `Áp dụng mã ${res.data.code} thành công: Giảm ${convertPrice(
            res.data.discountAmount
          )}`
        );
        setIsOpenModalVoucher(false);
      } else {
        message.error(res?.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (err) {
      message.error(
        err?.response?.data?.message || 'Không thể áp dụng mã giảm giá'
      );
    } finally {
      setLoadingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    message.info('Đã hủy áp dụng mã giảm giá');
  };

  const mutationUpdate = useMutationHooks((data) => {
    const { id, token, ...rests } = data;
    return UserService.updateUser(id, { ...rests }, token);
  });

  const mutationAddOrder = useMutationHooks((data) => {
    const { token, ...rests } = data;
    return OrderService.createOrder({ ...rests }, token);
  });

  const { isPending } = mutationUpdate;
  const { isPending: isPendingAddOrder } = mutationAddOrder;

  const handleCancelUpdate = () => {
    setstateUserDetails({
      name: '',
      email: '',
      phone: '',
      isAdmin: false,
    });
    form.resetFields(false);
    setIsOpenModalUpdateInfo(false);
  };

  const handleAddOrder = async () => {
    const { token, userId } = getAuthTokenAndId();

    if (!userId || !token) {
      message.warning('Vui lòng đăng nhập tài khoản để đặt hàng');
      navigate('/sign-in', { state: location?.pathname || '/payment' });
      return;
    }

    if (!order?.orderItemsSelected?.length) {
      message.error('Vui lòng chọn sản phẩm trong giỏ hàng trước khi đặt hàng');
      navigate('/order');
      return;
    }

    // Kiểm tra đầy đủ thông tin giao hàng
    if (!user?.name || !user?.address || !user?.phone || !user?.city) {
      message.warning('Vui lòng hoàn tất họ tên, số điện thoại, địa chỉ và tỉnh/thành trước khi đặt hàng');
      setIsOpenModalUpdateInfo(true);
      return;
    }

    const arrayOrdered = [];
    order?.orderItemsSelected?.forEach((el) => {
      arrayOrdered.push(el.product);
    });

    const orderPayload = {
      token: token,
      orderItems: order?.orderItemsSelected,
      fullName: user?.name,
      address: user?.address,
      phone: user?.phone,
      city: user?.city,
      paymentMethod: payment,
      itemsPrice: priceMemo,
      shippingPrice: deliveryPriceMemo,
      discountPrice: appliedVoucher?.discountAmount || 0,
      voucherCode: appliedVoucher?.code || '',
      voucherDiscount: appliedVoucher?.discountValue || 0,
      totalPrice: totalPriceMemo,
      user: userId,
      isPaid: false,
      email: user?.email || '',
    };

    if (payment === 'vnpay') {
      try {
        const resOrder = await OrderService.createOrder(
          orderPayload,
          token
        );
        if (resOrder?.status === 'OK') {
          const orderId = resOrder?.data?._id || `DH${Date.now()}`;
          const resVNPay = await PaymentService.createVNPayPayment({
            orderId: orderId,
            orderInfo: `Thanh toan don hang ${orderId}`,
          }, token);

          if (resVNPay?.status === 'OK' && resVNPay?.paymentUrl) {
            dispatch(removeAllOrderProduct({ listChecked: arrayOrdered }));
            window.location.href = resVNPay.paymentUrl;
            return;
          } else {
            message.error(resVNPay?.message || 'Không thể tạo liên kết thanh toán VNPay');
          }
        } else {
          message.error(resOrder?.message || 'Tạo đơn hàng thất bại');
        }
      } catch (err) {
        message.error('Khởi tạo thanh toán VNPay thất bại');
        return;
      }
    } else {
      // Xử lý COD hoặc VietQR trực tiếp qua callback
      if (payment === 'vietqr' && !vietQRConfig) {
        message.error('VietQR chưa được cấu hình. Vui lòng chọn phương thức khác.');
        return;
      }
      mutationAddOrder.mutate(orderPayload, {
        onSuccess: (resOrder) => {
          if (resOrder?.status === 'OK') {
            dispatch(removeAllOrderProduct({ listChecked: arrayOrdered }));

            if (payment === 'vietqr') {
              const createdId = resOrder?.data?._id || `DH${Date.now()}`;
              setCreatedOrderData({
                ...(resOrder?.data || {}),
                _id: createdId,
                orderedItems: [...(order?.orderItemsSelected || [])],
              });
              setIsOpenModalVietQR(true);
            } else {
              message.success('Đặt hàng thành công');
              navigate('/orderSuccess', {
                state: {
                  delivery,
                  payment,
                  orders: order?.orderItemsSelected,
                  totalPriceMemo: totalPriceMemo,
                  appliedVoucher: appliedVoucher,
                },
              });
            }
          } else {
            message.error(resOrder?.message || 'Đặt hàng thất bại');
          }
        },
        onError: (err) => {
          message.error(err?.response?.data?.message || 'Đặt hàng thất bại');
        }
      });
    }
  };

  const createPayPalOrder = async (actions) => {
    const { token } = getAuthTokenAndId();
    if (!token || !user?.name || !user?.address || !user?.phone || !user?.city || !order?.orderItemsSelected?.length) {
      throw new Error('Vui lòng đăng nhập, chọn sản phẩm và hoàn tất thông tin giao hàng');
    }
    const response = await OrderService.createOrder({
      orderItems: order.orderItemsSelected,
      fullName: user.name,
      address: user.address,
      phone: user.phone,
      city: user.city,
      paymentMethod: 'paypal',
      voucherCode: appliedVoucher?.code || '',
    }, token);
    if (response?.status !== 'OK') throw new Error(response?.message || 'Không thể tạo đơn hàng');
    paypalDatabaseOrderId.current = response.data._id;
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: (response.data.totalPrice / PAYPAL_VND_PER_USD).toFixed(2),
          currency_code: 'USD',
        },
      }],
    });
  };

  const onSuccessPaypal = async (details) => {
    const { token } = getAuthTokenAndId();
    const verification = await PaymentService.verifyPayPalPayment({
      orderId: paypalDatabaseOrderId.current,
      paypalOrderId: details.id,
    }, token);
    if (verification?.status !== 'OK') throw new Error(verification?.message || 'Không thể xác minh thanh toán PayPal');

    const selectedProductIds = order.orderItemsSelected.map((item) => item.product);
    dispatch(removeAllOrderProduct({ listChecked: selectedProductIds }));
    message.success('Đặt hàng thành công');
    navigate('/orderSuccess', {
      state: {
        delivery,
        payment,
        orders: order.orderItemsSelected,
        totalPriceMemo: verification.data.totalPrice,
        appliedVoucher,
      },
    });
  };

  const handleUpdateInfoUser = () => {
    const { name, address, city, phone } = stateUserDetails;
    if (!name || !address || !city || !phone) {
      message.warning('Vui lòng nhập đầy đủ: Họ tên, Số điện thoại, Địa chỉ, Tỉnh/Thành');
      return;
    }

    const { token, userId } = getAuthTokenAndId();
    if (!userId || !token) {
      message.warning('Vui lòng đăng nhập để lưu thông tin');
      return;
    }

    mutationUpdate.mutate(
      { id: userId, token: token, ...stateUserDetails },
      {
        onSuccess: (res) => {
          if (res?.status === 'ERR') {
            message.error(res?.message || 'Cập nhật thông tin thất bại');
            return;
          }
          dispatch(updateUser({ name, address, city, phone, id: userId, access_token: token }));
          setIsOpenModalUpdateInfo(false);
          message.success('Cập nhật thông tin nhận hàng thành công');
        },
        onError: () => {
          message.error('Cập nhật thông tin thất bại');
        }
      }
    );
  };

  const handleDelivery = (e) => {
    setDelivery(e.target.value);
  };

  const handlePayment = (e) => {
    setPayment(e.target.value);
  };

  const addPaypalScript = async () => {
    try {
      const res = await PaymentService.getConfig();
      setClientId(res.data);
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${res.data}&currency=USD`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    } catch (e) {
      console.error('Lỗi nạp PayPal SDK:', e);
    }
  };

  useEffect(() => {
    if (!window.paypal) {
      addPaypalScript();
    } else {
      setSdkReady(true);
    }

    return () => {
      const script = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (script) script.remove();
    };
  }, []);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép ${label}!`);
  };

  const vietQRAddInfo = createdOrderData?._id
    ? `DH${createdOrderData._id.slice(-6).toUpperCase()}`
    : 'FASHIONSTYLE';
  const vietQRUrl = vietQRConfig
    ? `https://api.vietqr.io/image/${encodeURIComponent(vietQRConfig.bankId)}-${encodeURIComponent(vietQRConfig.accountNo)}-${encodeURIComponent(vietQRConfig.template)}.jpg?amount=${totalPriceMemo}&addInfo=${encodeURIComponent(vietQRAddInfo)}&accountName=${encodeURIComponent(vietQRConfig.accountName)}`
    : '';

  const handleFinishVietQR = () => {
    setIsOpenModalVietQR(false);
    message.success('Đặt hàng thành công! Vui lòng chờ nhân viên xác nhận chuyển khoản.');
    navigate('/orderSuccess', {
      state: {
        delivery,
        payment: 'vietqr',
        orders: createdOrderData?.orderedItems || order?.orderItemsSelected,
        totalPriceMemo: totalPriceMemo,
        appliedVoucher: appliedVoucher,
        orderId: createdOrderData?._id,
      },
    });
  };

  return (
    <div style={{ background: '#fff', width: '100%', minHeight: '100vh' }}>
      <Loading isPending={isPendingAddOrder}>
        <div style={{ height: '1px', backgroundColor: '#eee' }}></div>

        <div style={{ width: '100%', maxWidth: '1270px', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Trang chủ</span>
            <span style={{ margin: '0 6px' }}>{'>'}</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/order')}>Giỏ hàng</span>
            <span style={{ margin: '0 6px' }}>{'>'}</span>
            <span style={{ color: '#000', fontWeight: '500' }}>Thanh toán</span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
            Phương thức thanh toán & Đặt hàng
          </h1>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', width: '100%' }}>
              <WrapperLeft>
                <WrapperInfo>
                  <div>
                    <Label>Chọn phương thức giao hàng</Label>
                    <WrapperRadio onChange={handleDelivery} value={delivery}>
                      <Radio value="fast">
                        <span style={{ color: '#ea8500', fontWeight: 'bold' }}>FAST</span> Giao hàng tiêu chuẩn (Tiết kiệm)
                      </Radio>
                      <Radio value="gojek">
                        <span style={{ color: '#00aa13', fontWeight: 'bold' }}>GOJEK</span> Giao hàng hỏa tốc
                      </Radio>
                    </WrapperRadio>
                  </div>
                </WrapperInfo>

                <WrapperInfo>
                  <div>
                    <Label>Chọn phương thức thanh toán</Label>
                    <WrapperRadio onChange={handlePayment} value={payment}>
                      <Radio value="later_money">
                        <span style={{ fontWeight: '500' }}>Thanh toán tiền mặt khi nhận hàng (COD)</span>
                      </Radio>
                      <Radio value="vietqr">
                        <span style={{ fontWeight: '600', color: '#0052cc' }}>
                          <QrcodeOutlined style={{ marginRight: 6, fontSize: '16px' }} />
                          Chuyển khoản VietQR (Quét mã 24/7)
                        </span>
                        <Tag color="cyan" style={{ marginLeft: 8 }}>Khuyên dùng</Tag>
                      </Radio>
                      <Radio value="vnpay">
                        <span style={{ fontWeight: '600', color: '#ed1c24' }}>
                          Thanh toán trực tuyến VNPAY (ATM / Visa / QR)
                        </span>
                        <Tag color="volcano" style={{ marginLeft: 8 }}>Ví / Thẻ</Tag>
                      </Radio>
                      <Radio value="paypal">
                        <span>Thanh toán bằng ví điện tử quốc tế Paypal</span>
                      </Radio>
                    </WrapperRadio>
                  </div>
                </WrapperInfo>
              </WrapperLeft>

              <WrapperRight>
                <WrapperInfo>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: '600', color: '#111' }}>Thông tin người nhận</span>
                      <span
                        onClick={handleChangeAddress}
                        style={{ color: '#1890ff', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}
                      >
                        Thay đổi
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Họ tên: </span>
                      <span style={{ fontWeight: '600' }}>
                        {user?.name || <span style={{ color: '#ff4d4f' }}>Chưa có họ tên</span>}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Số điện thoại: </span>
                      <span style={{ fontWeight: '600' }}>
                        {user?.phone || <span style={{ color: '#ff4d4f' }}>Chưa có SĐT (Bấm "Thay đổi" để thêm)</span>}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Địa chỉ: </span>
                      <span style={{ color: '#0052cc', fontWeight: '600' }}>
                        {user?.address ? `${user?.address}, ${user?.city || ''}` : <span style={{ color: '#ff4d4f' }}>Chưa có địa chỉ</span>}
                      </span>
                    </div>
                    {(!user?.name || !user?.phone || !user?.address || !user?.city) && (
                      <div style={{ marginTop: 8 }}>
                        <Tag color="warning" style={{ whiteSpace: 'normal', height: 'auto', padding: '4px 8px' }}>
                          ⚠️ Vui lòng bấm "Thay đổi" để bổ sung đầy đủ tên, SĐT và địa chỉ trước khi đặt hàng.
                        </Tag>
                      </div>
                    )}
                  </div>
                </WrapperInfo>

                {/* Khung Mã giảm giá (Voucher) */}
                <WrapperInfo>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <GiftOutlined style={{ color: '#ff4d4f' }} /> Mã giảm giá (Voucher)
                      </span>
                      <span
                        onClick={() => setIsOpenModalVoucher(true)}
                        style={{ color: '#1890ff', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                      >
                        Chọn voucher có sẵn ({availableVouchers.length})
                      </span>
                    </div>

                    {appliedVoucher ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#f6ffed',
                          border: '1px solid #b7eb8f',
                          padding: '10px 14px',
                          borderRadius: '6px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#52c41a', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircleOutlined /> {appliedVoucher.code}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{appliedVoucher.name}</div>
                        </div>
                        <Button
                          size="small"
                          danger
                          type="link"
                          onClick={handleRemoveVoucher}
                          style={{ padding: 0 }}
                        >
                          Bỏ chọn
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Input
                          placeholder="Nhập mã voucher (VD: FASHION10)"
                          value={voucherInput}
                          onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                          style={{ textTransform: 'uppercase' }}
                          onPressEnter={() => handleApplyVoucher()}
                        />
                        <Button
                          onClick={() => handleApplyVoucher()}
                          loading={loadingVoucher}
                          type="primary"
                          style={{ background: '#000', borderColor: '#000' }}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    )}
                  </div>
                </WrapperInfo>

                <div style={{ width: '100%' }}>
                  <WrapperInfo>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Tạm tính</span>
                      <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                        {convertPrice(priceMemo)}
                      </span>
                    </div>

                    {priceDiscountMemo > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Giảm giá sản phẩm</span>
                        <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                          -{convertPrice(priceDiscountMemo)}
                        </span>
                      </div>
                    )}

                    {appliedVoucher && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#52c41a', fontWeight: '500' }}>
                          Voucher ({appliedVoucher.code})
                        </span>
                        <span style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'bold' }}>
                          -{convertPrice(appliedVoucher.discountAmount)}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Phí giao hàng</span>
                      <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                        {convertPrice(deliveryPriceMemo)}
                      </span>
                    </div>
                  </WrapperInfo>

                  <WrapperTotal>
                    <span>Tổng thanh toán</span>
                    <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                      <span style={{ color: 'rgb(254, 56, 52)', fontSize: '24px', fontWeight: 'bold' }}>
                        {convertPrice(totalPriceMemo)}
                      </span>
                      <span style={{ color: '#888', fontSize: '11px' }}>Đã bao gồm VAT nếu có</span>
                    </span>
                  </WrapperTotal>
                </div>

                {/* Nút thanh toán */}
                {payment === 'paypal' && sdkReady ? (
                  <div style={{ width: '320px', marginTop: '10px' }}>
                    <PayPalScriptProvider options={{ 'client-id': clientId, currency: 'USD' }}>
                      <PayPalButtons
                        createOrder={(data, actions) => createPayPalOrder(actions)}
                        onApprove={(data, actions) => {
                          return actions.order.capture().then(onSuccessPaypal);
                        }}
                        onError={(error) => {
                          message.error(error?.message || 'Thanh toán PayPal thất bại');
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                ) : payment === 'vietqr' ? (
                  <ButtonComponent
                    onClick={handleAddOrder}
                    size={40}
                    styleButton={{
                      background: '#0052cc',
                      height: '46px',
                      width: '100%',
                      border: 'none',
                      borderRadius: '24px',
                      marginTop: '10px',
                    }}
                    styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}
                    textButton="Đặt hàng & Quét mã VietQR"
                  />
                ) : payment === 'vnpay' ? (
                  <ButtonComponent
                    onClick={handleAddOrder}
                    size={40}
                    styleButton={{
                      background: '#ed1c24',
                      height: '46px',
                      width: '100%',
                      border: 'none',
                      borderRadius: '24px',
                      marginTop: '10px',
                    }}
                    styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}
                    textButton="Thanh toán qua VNPAY"
                  />
                ) : (
                  <ButtonComponent
                    onClick={handleAddOrder}
                    size={40}
                    styleButton={{
                      background: '#000',
                      height: '44px',
                      width: '100%',
                      border: 'none',
                      borderRadius: '24px',
                      marginTop: '10px',
                    }}
                    styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}
                    textButton="Đặt hàng (Thanh toán khi nhận)"
                  />
                )}
              </WrapperRight>
            </div>
          </div>
        </div>

        {/* Modal Danh sách Voucher có sẵn */}
        <Modal
          title={<span><GiftOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />Danh sách mã giảm giá khả dụng</span>}
          open={isOpenModalVoucher}
          onCancel={() => setIsOpenModalVoucher(false)}
          footer={null}
          width={550}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', padding: '4px' }}>
            {availableVouchers?.length > 0 ? (
              availableVouchers.map((item) => {
                const isApplicable = priceMemo >= (item.minOrderValue || 0);
                return (
                  <div
                    key={item._id}
                    style={{
                      border: '1px dashed #d9d9d9',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: isApplicable ? '#fafafa' : '#fff1f0',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color={isApplicable ? 'red' : 'default'} style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          {item.code}
                        </Tag>
                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                        Đơn tối thiểu: {convertPrice(item.minOrderValue)} | Hạn dùng:{' '}
                        {new Date(item.endDate).toLocaleDateString('vi-VN')}
                      </div>
                      {!isApplicable && (
                        <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: 2 }}>
                          Mua thêm {convertPrice(item.minOrderValue - priceMemo)} để dùng mã này
                        </div>
                      )}
                    </div>
                    <Button
                      type="primary"
                      disabled={!isApplicable}
                      style={{ background: isApplicable ? '#000' : '#ccc', borderColor: isApplicable ? '#000' : '#ccc' }}
                      onClick={() => handleApplyVoucher(item.code)}
                    >
                      Dùng ngay
                    </Button>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                Hiện tại chưa có mã giảm giá nào khả dụng
              </div>
            )}
          </div>
        </Modal>

        {/* Modal VietQR Thanh toán 24/7 */}
        <Modal
          title={
            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#0052cc' }}>
              <QrcodeOutlined style={{ marginRight: 8 }} />
              Quét mã VietQR để thanh toán đơn hàng
            </div>
          }
          open={isOpenModalVietQR}
          onCancel={handleFinishVietQR}
          footer={[
            <Button
              key="done"
              type="primary"
              size="large"
              style={{ width: '100%', background: '#0052cc', height: '44px', fontWeight: '600' }}
              onClick={handleFinishVietQR}
            >
              Tôi đã chuyển khoản thành công
            </Button>,
          ]}
          width={450}
          centered
        >
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: 12 }}>
              Mở ứng dụng ngân hàng bất kỳ (MB, Vietcombank, Techcombank, MoMo...) và quét mã QR bên dưới:
            </p>

            {/* Ảnh VietQR động chuẩn NAPAS */}
            <div style={{ display: 'inline-block', padding: 8, background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <img
                src={vietQRUrl}
                alt="Mã VietQR thanh toán"
                style={{ width: '280px', height: 'auto', display: 'block', borderRadius: 8 }}
              />
            </div>

            {/* Bảng chi tiết chuyển khoản */}
            <div style={{ marginTop: 16, background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px', textAlign: 'left', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#666' }}>Ngân hàng:</span>
                <span style={{ fontWeight: 'bold', color: '#e01e26' }}>{vietQRConfig?.bankName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: '#666' }}>Số tài khoản:</span>
                <span style={{ fontWeight: 'bold', color: '#0052cc', cursor: 'pointer', fontSize: '15px' }} onClick={() => copyToClipboard(vietQRConfig?.accountNo, 'Số tài khoản')}>
                  {vietQRConfig?.accountNo} <CopyOutlined />
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#666' }}>Chủ tài khoản:</span>
                <span style={{ fontWeight: 'bold' }}>{vietQRConfig?.accountName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: '#666' }}>Số tiền:</span>
                <span style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: '15px' }} onClick={() => copyToClipboard(totalPriceMemo, 'Số tiền')}>
                  {convertPrice(totalPriceMemo)} <CopyOutlined />
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666' }}>Nội dung CK:</span>
                <span style={{ fontWeight: 'bold', color: '#0052cc', background: '#e6f7ff', padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }} onClick={() => copyToClipboard(vietQRAddInfo, 'Nội dung chuyển khoản')}>
                  {vietQRAddInfo} <CopyOutlined />
                </span>
              </div>
            </div>
          </div>
        </Modal>

        {/* Modal Cập nhật thông tin giao hàng */}
        <ModalComponent
          forceRender
          title="Cập nhật thông tin giao hàng"
          open={isOpenModalUpdateInfo}
          onCancel={handleCancelUpdate}
          onOk={handleUpdateInfoUser}
        >
          <Loading isPending={isPending}>
            <Form
              name="basic"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
              autoComplete="on"
              form={form}
            >
              <Form.Item
                label="Họ tên"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input
                  value={stateUserDetails['name']}
                  onChange={(e) => setstateUserDetails({ ...stateUserDetails, name: e.target.value })}
                  name="name"
                />
              </Form.Item>

              <Form.Item
                label="Tỉnh/Thành"
                name="city"
                rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố!' }]}
              >
                <Input
                  value={stateUserDetails['city']}
                  onChange={(e) => setstateUserDetails({ ...stateUserDetails, city: e.target.value })}
                  name="city"
                />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input
                  value={stateUserDetails['phone']}
                  onChange={(e) => setstateUserDetails({ ...stateUserDetails, phone: e.target.value })}
                  name="phone"
                />
              </Form.Item>

              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
              >
                <Input
                  value={stateUserDetails['address']}
                  onChange={(e) => setstateUserDetails({ ...stateUserDetails, address: e.target.value })}
                  name="address"
                />
              </Form.Item>
            </Form>
          </Loading>
        </ModalComponent>
      </Loading>
    </div>
  );
};

export default PaymentPage;
