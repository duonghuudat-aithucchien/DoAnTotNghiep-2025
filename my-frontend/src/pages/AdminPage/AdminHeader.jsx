import React, { useEffect, useState } from 'react';
import { Input, Badge, Dropdown, Avatar, List } from 'antd';
import { BellOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as UserService from '../../service/UserService';
import { resetUser } from '../../redux/slides/userSlide';
import { markAllAsRead } from '../../redux/slides/notificationSlice';

import {
  WrapperHeader,
  WrapperLogo,
  WrapperSearch,
  WrapperRightSection,
  WrapperLanguage,
  WrapperUserInfo,
} from './AdminHeaderStyle';

const HeaderComponent = () => {
  const user = useSelector((state) => state.user);
  const order = useSelector((state) => state.order);
  const notifications = useSelector((state) => state.notification.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    setUserName(user?.name || user?.email || 'User');
    setUserRole(user?.isAdmin ? 'Admin' : 'Khách');
    setUserAvatar(user?.avatar || ''); 
  }, [user]);
  

  const handleLogout = async () => {
    await UserService.logoutUser();
    dispatch(resetUser());
    navigate('/');
  };



  const items = [
    { key: '1', label: <div onClick={handleLogout}>Đăng xuất</div> },
  ];

  const handleNotificationClick = () => {
    dispatch(markAllAsRead());
  };

  const notificationDropdown = {
    items: [
      {
        key: 'notifications',
        label: (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item style={{ fontWeight: item.read ? 400 : 600 }}>
                {item.message}
              </List.Item>
            )}
            locale={{ emptyText: 'Không có thông báo nào' }}
            style={{ width: 250, maxHeight: 300, overflowY: 'auto' }}
          />
        ),
      },
    ],
  };

  return (
    <WrapperHeader>
      <WrapperLogo onClick={() => navigate('/')}>
        <span style={{ color: '#2F54EB', fontWeight: 'bold' }}>Fashion</span>
        <span style={{ fontWeight: 500 }}>Style</span>
      </WrapperLogo>



      <WrapperRightSection>
      <Dropdown
          menu={notificationDropdown}
          trigger={['click']}
          placement="bottomRight"
          onOpenChange={handleNotificationClick}
        >
          <Badge count={unreadCount} size="small" offset={[-2, 2]}>
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>
        </Dropdown>
    

        <Dropdown menu={{ items }} placement="bottomRight">
          <WrapperUserInfo>
            <Avatar size="small" src={userAvatar} />
            <div style={{ marginLeft: 8 }}>
              <div style={{ fontWeight: 500 }}>{userName}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{userRole}</div>
            </div>
          </WrapperUserInfo>
        </Dropdown>
      </WrapperRightSection>
    </WrapperHeader>
  );
};

export default HeaderComponent;
