import React, { useEffect, useRef, useState } from 'react'
import { WrapperHeader } from './style'
import { Button, Form, Space } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import TableComponent from '../TableComponent/TableComponent'
import InputComponent from '../InputComponent/InputComponent'
import { getBase64 } from '../../utils'
import { WrapperUploadFile } from './style'
//import { createuser } from '../../service/UserService'
import * as UserService from '../../service/UserService'
import { useMutationHooks } from '../../hooks/useMutationHook'
import Loading from '../LoadingComponent/Loading'
import * as message from '../../components/Message/Message'
import { useQuery } from '@tanstack/react-query'
import DrawerComponent from '../DrawerComponent/DrawerComponent'
import { useSelector } from 'react-redux'
import ModalComponent from '../ModalComponent/ModalComponent'
import { Tag } from 'antd';





const AdminUser = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false)
      const [isModalOpenDelete, setisModalOpenDelete] = useState(false)
      const [rowSelected, setRowSelected] = useState('')
      const [isOpenDrawer, setIsOpenDrawer] = useState(false)
      const [isPendingUpdate, setIsPendingUpdate] = useState(false)
      const user = useSelector((state) => state?.user)
  
    //   const [searchText, setSearchText] = useState('');
    //   const [searchedColumn, setSearchedColumn] = useState('');
      const searchInput = useRef(null);
  

      const [stateUserDetails, setstateUserDetails] = useState({
        name: '',
        email: '',
        phone: '',
        isAdmin: false,
        avatar: '',
        address: ''
      })
  
      const [form] = Form.useForm()

      const mutationUpdate = useMutationHooks(
          (data) => {
              const {id, token, ...rests} = data
              const res = UserService.updateUser(
                  id, {...rests}, token
              )
              return res
          },
          
      )
  
      const mutationDelete = useMutationHooks(
          (data) => {
              const {id, token} =data
              const res = UserService.deleteUser(
                  id, token
              )
              return res
          }   
      )

          const mutationDeleteMany = useMutationHooks(
              (data) => {
                  const {token, ...ids} =data
                  const res = UserService.deleteManyUser(
                      ids, token
                  )
                  return res
              }
              
          )

      const {data: dataUpdated, isPending: isPendingUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated} = mutationUpdate
      const {data: dataDeleted, isPending: isPendingDeleted, isSuccess: isSuccessDeleted, isError: isErrorUDeleted} = mutationDelete
      const {data: dataDeletedMany, isPending: isPendingDeletedMany, isSuccess: isSuccessDeletedMany, isError: isErrorUDeletedMany} = mutationDeleteMany

 
      const getAllUsers = async () => {
          const res = await UserService.getAllUser(user?.access_token)
          return res
      }
  
      const fetchgetDetailsUser = async (rowSelected) => {
          try {
              const res = await UserService.getDetailsUser(rowSelected);
              if (res?.data) {
                  setstateUserDetails({
                      name: res.data.name,
                      email: res.data.email,
                      phone: res.data.phone,
                      isAdmin: res.data.isAdmin,
                      address: res.data.address,
                      avatar: res.data.avatar
                      
                  });
              }
              setIsPendingUpdate(false)
  
          } catch (error) {
              console.error("Error fetching user details:", error);
          }
      };
      
  
      useEffect(() => {
          form.setFieldsValue(stateUserDetails)
      }, [form, stateUserDetails])
  
      useEffect(() => {
          if(rowSelected && isOpenDrawer) {
              setIsPendingUpdate(true)
             fetchgetDetailsUser(rowSelected) 
          }
      }, [rowSelected, isOpenDrawer])
  
      const handleDetailsUser = () => {
          setIsOpenDrawer(true)
      }

      const handleDeleteManyUsers = (ids) => {
        mutationDeleteMany.mutate({ids: ids, token: user?.access_token}, {
            onSettled: () => {
                queryUser.refetch()
            }
        })
    }

  
  
      const queryUser = useQuery({queryKey: ['users'], queryFn: getAllUsers})
      const {isPending: isPendingUsers, data: users } = queryUser
      const renderAction = () => {
          return (
              <div>
                  <DeleteOutlined style={{color: 'red', fontSize: '30px', cursor: 'pointer'}} onClick={() => setisModalOpenDelete(true)}/>
                  <EditOutlined style={{color: 'orange', fontSize: '30px', cursor: 'pointer'}} onClick={handleDetailsUser}/>
              </div>
          )
      }
  
      const handleSearch = (selectedKeys, confirm, dataIndex) => {
          confirm();
          // setSearchText(selectedKeys[0]);
          // setSearchedColumn(dataIndex);
        };
        const handleReset = (clearFilters) => {
          clearFilters();
          // setSearchText('');
        };
  
      const getColumnSearchProps = (dataIndex) => ({
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
              style={{
                padding: 8,
              }}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <InputComponent
                ref={searchInput}
                placeholder={`Search ${dataIndex}`}
                value={`${selectedKeys[0] || ''}`}
                onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                style={{
                  marginBottom: 8,
                  display: 'block',
                }}
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{
                    width: 90,
                  }}
                >
                  Search
                </Button>
                <Button
                  onClick={() => clearFilters && handleReset(clearFilters)}
                  size="small"
                  style={{
                    width: 90,
                  }}
                >
                  Reset
                </Button>
                
                
              </Space>
            </div>
          ),
          filterIcon: (filtered) => (
            <SearchOutlined
              style={{
                color: filtered ? '#1890ff' : undefined,
              }}
            />
          ),
          onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
          onFilterDropdownOpenChange: (visible) => {
            if (visible) {
              setTimeout(() => searchInput.current?.select(), 100);
            }
          },
          // render: (text) =>
          //   searchedColumn === dataIndex ? (
          //     // <Highlighter
          //     //   highlightStyle={{
          //     //     backgroundColor: '#ffc069',
          //     //     padding: 0,
          //     //   }}
          //     //   searchWords={[searchText]}
          //     //   autoEscape
          //     //   textToHighlight={text ? text.toString() : ''}
          //     // />
          //   ) : (
          //     text
          //   ),
        });

        const getStatusTag = (status) => {
          switch (status) {
            case "pending":
              return <Tag color="gold">Chờ xử lý</Tag>;
            case "processing":
              return <Tag color="blue">Đang xử lý</Tag>;
            case "delivering":
              return <Tag color="cyan">Đang giao hàng</Tag>;
            case "delivered":
              return <Tag color="green">Đã giao</Tag>;
            case "cancelled":
              return <Tag color="red">Đã hủy</Tag>;
            default:
              return <Tag color="default">Không rõ</Tag>;
          }
        };
  
      const columns = [
        {
          title: 'Họ tên',
          dataIndex: 'name',
          sorter: (a, b) => a.name.length - b.name.length,
          ...getColumnSearchProps('name'),
          render: (_, record) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={record.avatar}
                alt={record.name}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <span>{record.name}</span>
            </div>
          )
        },
        
          {
            title: 'Email',
            dataIndex: 'email',
            sorter: (a, b) => a.email.length - b.email.length,
            ...getColumnSearchProps('email')
          },
          {
            title: 'Địa chỉ',
            dataIndex: 'address',
            sorter: (a, b) => a.address.length - b.address.length,
            ...getColumnSearchProps('address')
          },
          
          {
            title: 'Trạng thái',
            dataIndex: 'isAdmin',
            render: (isAdmin) =>
              String(isAdmin) === 'true' ? (
                <Tag color="volcano">Admin</Tag>
              ) : (
                <Tag color="blue">Người dùng</Tag>
              ),
            filters: [
              { text: 'Admin', value: 'true' },
              { text: 'Người dùng', value: 'false' },
            ],
            onFilter: (value, record) => String(record.isAdmin) === value,
          },
          
          
          {
            title: 'Điện thoại',
            dataIndex: 'phone',
            sorter: (a, b) => a.phone.length - b.phone.length,
            ...getColumnSearchProps('phone')
          },
          {
            title: 'Tuỳ chọn',
            dataIndex: 'action',
            render: renderAction
          },
          
      ];
  
      const dataTable = users?.data?.length && users?.data?.map((user) => {
          return {...user, key: user._id}
        //   return {...user, key: user._id, isAdmin: user.isAdmin ? 'TRUE' : 'FALSE'}

      })
  
  
      //update
      useEffect(() => {
          if(isSuccessUpdated && dataUpdated?.status === 'OK') {
              message.success()
              handleCloseDrawer()
          } else if(isErrorUpdated){
              message.error()
          }
      }, [isSuccessUpdated])
  
      //delete
      useEffect(() => {
          if(isSuccessDeleted && dataDeleted?.status === 'OK') {
              message.success()
              handleCancelDelete()
          } else if(isErrorUDeleted){
              message.error()
          }
      }, [isSuccessDeleted])

      //deletemany
      useEffect(() => {
        if(isSuccessDeletedMany && dataDeletedMany?.status === 'OK') {
            message.success()
        } else if(isErrorUDeletedMany){
            message.error()
        }
    }, [isSuccessDeletedMany])
  
      const handleCloseDrawer = () => {
          setIsOpenDrawer(false)
          setstateUserDetails({
            name: '',
            email: '',
            phone: '',
            isAdmin: false
          })
          form.resetFields()
  
      }
  
      const handleCancelDelete = () => {
          setisModalOpenDelete(false)
      }
  
      const handledeleteUser = () => {
          mutationDelete.mutate({id: rowSelected, token: user?.access_token}, {
              onSettled: () => {
                  queryUser.refetch()
              }
          })
      }
  

      const handleOnchangeDetails = (e) => {
          setstateUserDetails({
              ...stateUserDetails,
              [e.target.name]: e.target.value
          })
      }

        const handleOnchangeAvatarDetails = async({fileList}) => {
            const file = fileList[0]
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj)
            }
            setstateUserDetails({
                ...stateUserDetails,
                avatar: file.preview
            })
        }

        const onupdateUser = () => {
            mutationUpdate.mutate({id: rowSelected, token: user?.access_token, ...stateUserDetails}, {
                onSettled: () => {
                    queryUser.refetch()
                }
            })
        }

  return (
    <div>
        <WrapperHeader>Quản lý người dùng</WrapperHeader>

          <div style={{marginTop: '20px'}}>
              <TableComponent handleDeleteMany={handleDeleteManyUsers} columns={columns} isPending={isPendingUsers} data={dataTable}
                  onRow={(record, rowIndex) => {
                      return {
                          onClick: even => {
                              setRowSelected(record._id)
                          }
                      }
                  }}
              />
          </div>

  
          <DrawerComponent title='Chi tiết người dùng' isOpen={isOpenDrawer} onClose={() => setIsOpenDrawer(false) } width="90%">
              <Loading isPending={isPendingUpdate || isPendingUpdated}>
                  <Form
                      name="basic"
                      labelCol={{
                          span: 2,
                      }}
                      wrapperCol={{
                          span: 22,
                      }}
                      onFinish={onupdateUser}
                      autoComplete="on"
                      form={form}
                  >
                  <Form.Item
                      label="Họ tên"
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
                      label="Email"
                      name="email"
                      rules={[
                      {
                          required: true,
                          message: 'Please input your email!',
                      },
                      ]}
                  >
                  <InputComponent value={stateUserDetails.email} onChange={handleOnchangeDetails} name="email"/>
                  </Form.Item>
  
                  <Form.Item
                      label="Điện thoại"
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
                      label="Địa chỉ"
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
    
                  <Form.Item
                      label="Ảnh đại diện"
                      name="avatar"
                      rules={[
                      {
                          required: true,
                          message: 'Please input your avatar!',
                      },
                      ]}
                  >
                      <WrapperUploadFile onChange={handleOnchangeAvatarDetails} maxCount={1}>
                          <Button icon={<UploadOutlined />}>Select file</Button>
                          {stateUserDetails?.avatar && (
                          <img src={stateUserDetails?.avatar} style={{
                              height: '60px',
                              width: '60px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              marginLeft: '10px'
                          }} alt='avatar'/>
                      )}
                      </WrapperUploadFile>
                   </Form.Item>
  
  
  
                  <Form.Item
                      wrapperCol={{
                      offset: 20,
                      span: 16,
                      }}
                  >
                  <Button type="primary" htmlType="submit">
                      Xác nhận
                  </Button>
                  </Form.Item>
  
                  </Form>
              </Loading>
          </ DrawerComponent>
  
          <ModalComponent forceRender title="Xoá người dùng " open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handledeleteUser}>
              <Loading isPending={isPendingDeleted}>
                  <div>Bạn có chắc chắn muốn xoá người dùng?</div>
              </Loading>
          </ModalComponent>
    </div>
  )
}

export default AdminUser