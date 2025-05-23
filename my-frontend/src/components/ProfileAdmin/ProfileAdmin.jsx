import React, { useCallback, useEffect, useState } from 'react'
import { WrapperContentProfile, WrapperHeader, WrapperInput, WrapperLabel, WrapperUploadFile } from './Style'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import { useDispatch, useSelector } from 'react-redux'
import * as UserService from '../../service/UserService'
import { useMutationHooks } from '../../hooks/useMutationHook'
import Loading from '../../components/LoadingComponent/Loading'
import * as message from '../../components/Message/Message'
import { updateUser } from '../../redux/slides/userSlide'
import { Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { getBase64 } from '../../utils'

export const ProfileAdmin = () => {
    const user = useSelector((state) => state.user)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [avatar, setAvatar] = useState('')
    const mutation = useMutationHooks(
        (data) => {
        const { id,access_token, ...rests} = data
        UserService.updateUser(id, rests, access_token)
        }
        
    )
    const dispatch = useDispatch()
    const { isPending, isSuccess, isError} =mutation

    useEffect(() => {
        setEmail(user?.email)
        setName(user?.name)
        setPhone(user?.phone)
        setAddress(user?.address)
        setAvatar(user?.avatar)
    }, [user])

    const handleGetDetailsUser = useCallback(async(id, token) => {
        const res = await UserService.getDetailsUser(id, token)
        dispatch(updateUser({...res?.data, access_token: token}))
    }, [dispatch])


    useEffect(() => {
        if(isSuccess) {
            message.success()
            handleGetDetailsUser(user?.id, user?.access_token)
        } else if(isError) {
            message.error()
        }
    }, [isSuccess, isError, handleGetDetailsUser, user?.id, user?.access_token])




    const handleOnchangeEmail = (value) => {
        setEmail(value)
    }
    const handleOnchangeName = (value) => {
        setName(value)
    }
    const handleOnchangePhone = (value) => {
        setPhone(value)
    }
    const handleOnchangeAddress = (value) => {
        setAddress(value)
    }
    const handleOnchangeAvatar = async({fileList}) => {
        const file = fileList[0]
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj)
        }
        setAvatar(file.preview)
    }

    const handleUpdate = () => {
        mutation.mutate( {id: user.id, email, name, address, phone, avatar, access_token: user?.access_token})
    }

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div
            style={{
              backgroundColor: '#fff',
              padding: '40px 60px',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: '800px',
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '24px', fontWeight: '600' }}>
              Thông tin admin
            </h2>
      
            <Loading isPending={isPending}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
                <div style={{ textAlign: 'center' }}>
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      style={{
                        height: '100px',
                        width: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #ccc',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '100px',
                        width: '100px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: '#999',
                      }}
                    >
                      ?
                    </div>
                  )}
                  <div style={{ marginTop: 10 }}>
                    <WrapperUploadFile onChange={handleOnchangeAvatar} maxCount={1}>
                      <Button icon={<UploadOutlined />}>Tải ảnh</Button>
                    </WrapperUploadFile>
                  </div>
                </div>
              </div>
      
              {/* FORM INPUT FIELDS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                  <WrapperLabel htmlFor="name">Tên</WrapperLabel>
                  <InputForm id="name" value={name} onChange={handleOnchangeName} />
                </div>
                <div>
                  <WrapperLabel htmlFor="email">Email</WrapperLabel>
                  <InputForm id="email" value={email} onChange={handleOnchangeEmail} />
                </div>
                <div>
                  <WrapperLabel htmlFor="phone">Số điện thoại</WrapperLabel>
                  <InputForm id="phone" value={phone} onChange={handleOnchangePhone} />
                </div>
                <div>
                  <WrapperLabel htmlFor="address">Địa chỉ</WrapperLabel>
                  <InputForm id="address" value={address} onChange={handleOnchangeAddress} />
                </div>
              </div>
      
              {/* NÚT CẬP NHẬT */}
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <ButtonComponent
                  onClick={handleUpdate}
                  textButton="Cập nhật thông tin"
                  styleButton={{
                    background: '#1677ff',
                    color: '#fff',
                    padding: '10px 32px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '16px',
                    height: 'auto',
                  }}
                  styleTextButton={{}}
                />
              </div>
            </Loading>
          </div>
        </div>
      );
      
}


export default ProfileAdmin






