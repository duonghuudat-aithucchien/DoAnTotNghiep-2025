


import React, { useEffect, useState } from 'react';
import { Badge, Popover, Dropdown, Menu } from 'antd';
import {
  WrapperHeader,
  WrapperHeaderLeft,
  WrapperLogo,
  WrapperNav,
  WrapperNavItem,
  WrapperIcons,
  WrapperTextHeaderSmall,
  WrapperHeaderAccount,
  WrapperContentPopup,
  TopBanner,
  CloseIcon,
} from './style';
import { CaretDownOutlined, ShoppingCartOutlined, UserOutlined, DownOutlined  } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as UserService from '../../service/UserService';
import { resetUser } from '../../redux/slides/userSlide';
import Loading from '../../components/LoadingComponent/Loading';
import { searchProduct } from '../../redux/slides/productSlide';
import TypeProduct from '../TypeProduct/TypeProduct';
import * as ProductService from '../../service/ProductService';
import ButtonInputSearch from '../ButtonInputSearch/ButtonInputSearch';

const HeaderComponent = () => {
  const user = useSelector((state) => state.user);
  const order = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [userName, setUserName] = useState('');
  const [search, setSearch] = useState('');
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [typeProducts, setTypeProducts] = useState([]);

  useEffect(() => {
    setLoading(true);
    setUserName(user?.name);
    setUserAvatar(user?.avatar);
    setLoading(false);
  }, [user?.name, user?.avatar]);

  const handleLogout = async () => {
    setLoading(true);
    await UserService.logoutUser();
    dispatch(resetUser());
    setLoading(false);
  };

  const handleNavigateLogin = () => {
    navigate('/sign-in');
  };

  const handleClickNavigate = (type) => {
    if (type === 'profile') {
      navigate('/profile-user');
    } else if (type === 'admin') {
      navigate('/system/admin');
    } else if (type === 'my-order') {
      navigate('/my-order', {
        state: {
          id: user?.id,
          token: user?.access_token,
        },
      });
    } else {
      handleLogout();
    }
    setIsOpenPopup(false);
  };

  const fetchAllTypeProduct = async () => {
    const res = await ProductService.getAllTypeProduct();
    if (res?.status === 'OK') {
      setTypeProducts(res?.data);
    }
  };

  useEffect(() => {
    fetchAllTypeProduct();
  }, []);

  const content = (
    <div>
      <WrapperContentPopup onClick={() => handleClickNavigate('profile')}>Thông tin người dùng</WrapperContentPopup>
      {user?.isAdmin === 'true' && (
        <WrapperContentPopup onClick={() => handleClickNavigate('admin')}>Admin</WrapperContentPopup>
      )}
      <WrapperContentPopup onClick={() => handleClickNavigate('my-order')}>Đơn hàng của tôi</WrapperContentPopup>
      <WrapperContentPopup onClick={() => handleClickNavigate()}>Đăng xuất</WrapperContentPopup>
    </div>
  );

  const handleChangeSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      setLoading(true);
      dispatch(searchProduct(trimmedSearch));
      setLoading(false);
    } else {
      dispatch(searchProduct('')) // reset về trạng thái ban đầu
    }
  };
  
  
  const handleResetSearch = () => {
    setSearch('');
    dispatch(searchProduct('')); // reset về rỗng
    navigate('/'); // về trang chủ
  };
  
  

  return (
    <>
      {showBanner && (
        <TopBanner>
          Đăng ký để nhận ngay ưu đãi tại cửa hàng.{' '}
          <u style={{ cursor: 'pointer' }} onClick={() => navigate('/sign-up')}>
            Đăng ký ngay
          </u>
          <CloseIcon onClick={() => setShowBanner(false)}>×</CloseIcon>
        </TopBanner>
      )}
      <WrapperHeader>
        <WrapperHeaderLeft>
        <WrapperLogo onClick={() => {
          handleResetSearch();
          navigate('/');
        }}>
          <span style={{ color: '#2F54EB', fontWeight: 'bold' }}>Fashion</span>
        <span style={{ fontWeight: 500 }}>Style</span>
        </WrapperLogo>
          {/* <WrapperNav>
            {typeProducts.map((item) => (
              <TypeProduct name={item} key={item} />
            ))}
          </WrapperNav> */}
          <WrapperNav>
  <Dropdown
    trigger={['click']}
    overlay={
      <Menu>
        {typeProducts.map((type) => (
          <Menu.Item key={type}>
            <TypeProduct name={type} />
          </Menu.Item>
        ))}
      </Menu>
    }
  >
    <WrapperNavItem style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
      Bộ Sưu Tập <DownOutlined />
    </WrapperNavItem>
  </Dropdown>

  {/* <WrapperNavItem>Flash Sale</WrapperNavItem> */}
  <WrapperNavItem onClick={() => navigate('/top-selling')}>Top Bán Chạy</WrapperNavItem>
  <WrapperNavItem onClick={() => navigate('/top-new')}>Sản Phẩm Mới</WrapperNavItem>
</WrapperNav>
        </WrapperHeaderLeft>

        <div style={{ width: '40%' }}>
          <ButtonInputSearch
            size="large"
            bordered={false}
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={handleChangeSearch}
            onSearch={handleSearch}
            textButton="Tìm kiếm"
          />
        </div>

        <WrapperIcons>
          <Loading isPending={loading}>
            <WrapperHeaderAccount>
              {userAvatar ? (
                <img src={userAvatar} alt="avatar" className="avatar" />
              ) : (
                <UserOutlined style={{ fontSize: '20px' }} />
              )}
              {user?.access_token ? (
                <Popover content={content} trigger="click" open={isOpenPopup}>
                  <div onClick={() => setIsOpenPopup((prev) => !prev)} style={{ cursor: 'pointer' }}>
                    {userName?.length ? userName : user?.email}
                  </div>
                </Popover>
              ) : (
                <div onClick={handleNavigateLogin} style={{ cursor: 'pointer' }}>
                  <WrapperTextHeaderSmall>Đăng nhập</WrapperTextHeaderSmall>
                </div>
              )}
            </WrapperHeaderAccount>
          </Loading>

          <Badge count={order?.orderItems?.length} size="small" onClick={() => navigate('/order')}>
            <ShoppingCartOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
          </Badge>
        </WrapperIcons>
      </WrapperHeader>
    </>
  );
};

export default HeaderComponent;
