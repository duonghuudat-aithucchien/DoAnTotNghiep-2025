// import React, { useEffect, useState } from 'react'
// import { Badge, Col, Popover } from 'antd';
// import { WrapperContentPopup, WrapperHeader, WrapperHeaderAccount, WrapperTextHeader, WrapperTextHeaderSmall } from './style';
// import { CaretDownOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
// import ButtonInputSearch from '../ButtonInputSearch/ButtonInputSearch';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import * as UserService from '../../service/UserService'
// import { resetUser } from '../../redux/slides/userSlide'
// import Loading from '../../components/LoadingComponent/Loading'
// import { searchProduct } from '../../redux/slides/productSlide';



// const HeaderComponent = ({isHiddenSearch = false, isHiddenCart = false}) => {

//   const user = useSelector((state) => state.user)
//   const dispatch = useDispatch()
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()
//   const [userAvatar, setUserAvatar] =useState('')
//   const [userName, setUserName] =useState('')
//   const [search, setSearch] = useState('')
//   const order = useSelector((state) => state.order)
//   const [isOpenPopup ,setIsOpenPopup] = useState(false)
//   const handleNavigateLogin = () => {
//     navigate('/sign-in')
//   }

//   const handleLogout = async () => {
//     setLoading(true)
//     await UserService.logoutUser()
//     dispatch(resetUser())
//     setLoading(false)
//   }

//   useEffect(() => {
//     setLoading(true)
//     setUserName(user?.name)
//     setUserAvatar(user?.avatar)
//     setLoading(false)
//   }, [user?.name, user?.avatar])

//   const content = (
//     <div>
//       <WrapperContentPopup onClick={() => handleClickNavigate('profile')}>Thông tin người dùng</WrapperContentPopup>
//       {user?.isAdmin && (
//         <WrapperContentPopup onClick={() => handleClickNavigate('admin')}>Admin</WrapperContentPopup>
//       )}

//       <WrapperContentPopup onClick={() => handleClickNavigate('my-order')}>Đơn hàng của tôi</WrapperContentPopup>
//       <WrapperContentPopup onClick={() => handleClickNavigate()}>Đăng xuất</WrapperContentPopup>

//     </div>
//   )

//   const handleClickNavigate = (type) => {
//     if(type === 'profile') {
//       navigate('/profile-user')
//     } else if (type === 'admin') {
//       navigate('/system/admin')
//     } else if (type === 'my-order') {
//       navigate('/my-order',{ state: {
//         id: user?.id,
//         token: user?.access_token
//         } 
//       })
//     } else {
//       handleLogout()
//     }
//     setIsOpenPopup(false)
//   }

//   const onSearch = (e) => {
//     setSearch(e.target.value)
//     dispatch(searchProduct(e.target.value))
//   }

//   return (
//     <div style={{width: '100%%', background:'rgb(26,148,255)', display: 'flex', justifyContent:'center'}}>
//       <WrapperHeader style={{justifyContent: isHiddenSearch && isHiddenSearch ? 'space-between' : 'unset'}}>
//         <Col span={5}>
//           <WrapperTextHeader onClick={() => navigate('/')}>DUONGHUUDAT</WrapperTextHeader>
//         </Col>
//         {!isHiddenSearch && (
//           <Col span={13}>
//           <ButtonInputSearch
//             size='large'
//             bordered={false}
//             textButton="Tìm kiếm"
//             placeholder="input search text"
//             onChange={onSearch}
//           />
//           </Col>
//         )}

        

//         <Col span={6} style={{display: 'flex', gap: '54px', alignItems: 'center'}} >
//         <Loading isPending={loading}>
//           <WrapperHeaderAccount>
//             {userAvatar ? (
//               <img src={userAvatar} alt='avatar' style={{
//                 height: '30px',
//                 width: '30px',
//                 borderRadius: '50%',
//                 objectFit: 'cover'
//               }}/>
//             ) : (  
//             <UserOutlined style={{fontSize: '30px'}}/>
//             )}
//             {user?.access_token ? (
//               <>
//                 <Popover content={content} trigger="click" open={isOpenPopup}>
//                   <div style={{ cursor: 'pointer' }} onClick={() => setIsOpenPopup((prev) => !prev)}>{userName?.length ? userName : user?.email}</div>
//                 </Popover>
//               </>
//             ) : ( 
//             <div onClick = {handleNavigateLogin} style = {{cursor: 'pointer'}}>
//               <WrapperTextHeaderSmall>Đăng nhập/Đăng ký</WrapperTextHeaderSmall>
//               <div>
//                 <WrapperTextHeaderSmall>Tài khoản</WrapperTextHeaderSmall>
//                 <CaretDownOutlined />
//               </div>
//             </div>
//             )}
//           </WrapperHeaderAccount>
//           </Loading>
//           {!isHiddenCart && (
//             <div onClick={() => navigate('/order')} style={{cursor: 'pointer'}}>
//             <Badge count={order?.orderItems?.length} size="small">
//               <ShoppingCartOutlined style={{fontSize: '30px', color: '#fff'}}/>
//             </Badge>
//             <WrapperTextHeaderSmall>Giỏ hàng</WrapperTextHeaderSmall>
//           </div>
//           )}
          
//         </Col>
//       </WrapperHeader>
//     </div>
//   )
// }

// export default HeaderComponent


import React, { useEffect, useState } from 'react';
import { Badge, Popover } from 'antd';
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
import { CaretDownOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
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
      {user?.isAdmin && (
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
          DUONGHUUDAT
        </WrapperLogo>
          <WrapperNav>
            {typeProducts.map((item) => (
              <TypeProduct name={item} key={item} />
            ))}
          </WrapperNav>
        </WrapperHeaderLeft>

        <div style={{ width: '30%' }}>
          <ButtonInputSearch
            size="large"
            bordered={false}
            placeholder="Search for products..."
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
