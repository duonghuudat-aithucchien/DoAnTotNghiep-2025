import React, { useEffect, useRef, useState } from 'react'
import { WrapperHeader } from './style'
import { Button, Form, Select, Space } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import TableComponent from '../TableComponent/TableComponent'
import InputComponent from '../InputComponent/InputComponent'
import { getBase64, renderOptions } from '../../utils'
import { WrapperUploadFile } from './style'
//import { createProduct } from '../../service/ProductService'
import * as ProductService from '../../service/ProductService'
import { useMutationHooks } from '../../hooks/useMutationHook'
import Loading from '../LoadingComponent/Loading'
import * as message from '../../components/Message/Message'
import { useQuery } from '@tanstack/react-query'
import DrawerComponent from '../DrawerComponent/DrawerComponent'
import { useSelector } from 'react-redux'
import ModalComponent from '../ModalComponent/ModalComponent'

const AdminProduct = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalOpenDelete, setisModalOpenDelete] = useState(false)
    const [rowSelected, setRowSelected] = useState('')
    const [isOpenDrawer, setIsOpenDrawer] = useState(false)
    const [isPendingUpdate, setIsPendingUpdate] = useState(false)
    const user = useSelector((state) => state?.user)
    const [typeSelect, setTypeSelect] = useState('')
    const searchInput = useRef(null);
    const inittial = () => ({
        name: '',
        price: '',
        description: '',
        rating: '',
        image: '',
        type: '',
        countInStock: '',
        newType: '',
        discount: '',
        sizes: '',
        colors: ''
    })

    const [stateProduct, setStateProduct] = useState(inittial())
    const [stateProductDetails, setStateProductDetails] = useState(inittial())

    const [form] = Form.useForm()

    const mutation = useMutationHooks(
        (data) => {
            const {name, price, description, rating, image, type, countInStock, discount, sizes, colors} =data
            const res = ProductService.createProduct({
                name, price, description, rating, image, type, countInStock, discount, sizes, colors
            })
            return res
        },
        {
            onSuccess: (data) => {
                if (data.status === 'OK') {
                    message.success("Sản phẩm đã được tạo thành công!");
                } else {
                    message.error("Lỗi khi tạo sản phẩm!");
                }
            },
            onError: (error) => {
                message.error("Có lỗi xảy ra khi tạo sản phẩm.");
            }
        }
    )

    const mutationUpdate = useMutationHooks(
        (data) => {
            const {id, token, ...rests} =data
            const res = ProductService.updateProduct(
                id, token, {...rests}
            )
            return res
        }
        
    )

    const mutationDelete = useMutationHooks(
        (data) => {
            const {id, token} =data
            const res = ProductService.deleteProduct(
                id, token
            )
            return res
        }
        
    )

    const mutationDeleteMany = useMutationHooks(
        (data) => {
            const {token, ...ids} =data
            const res = ProductService.deleteManyProduct(
                ids, token
            )
            return res
        }
        
    )


    const getAllProducts = async () => {
        const res = await ProductService.getAllProduct()
        return res
    }

    const fetchGetDetailsProduct = async (rowSelected) => {
        try {
            const res = await ProductService.getDetailsProduct(rowSelected);
            if (res?.data) {
                setStateProductDetails({
                    name: res?.data?.name,
                    price: res?.data?.price,
                    description: res?.data?.description,
                    rating: res?.data?.rating,
                    image: res?.data?.image,
                    type: res?.data?.type,
                    countInStock: res?.data?.countInStock,
                    discount: res?.data?.discount,
                    // sizes: res?.data?.sizes,
                    // colors: res?.data?.colors
                    sizes: Array.isArray(res?.data?.sizes)
        ? res.data.sizes
        : typeof res.data?.sizes === 'string'
            ? res.data.sizes.split(',')
            : [],
    colors: Array.isArray(res?.data?.colors)
        ? res.data.colors
        : typeof res.data?.colors === 'string'
            ? res.data.colors.split(',')
            : [],
                });
            }
            setIsPendingUpdate(false)

        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    };
    

    useEffect(() => {
        if(!isModalOpen) {
            form.setFieldsValue(stateProductDetails)
        } else {
            form.setFieldsValue(inittial())
        }
    }, [form, stateProductDetails, isModalOpen])

    useEffect(() => {
        if(rowSelected && isOpenDrawer) {
            setIsPendingUpdate(true)
           fetchGetDetailsProduct(rowSelected) 
        }
    }, [rowSelected, isOpenDrawer])

    const handleDetailsProduct = () => {
        setIsOpenDrawer(true)
    }

    const handleDeleteManyProducts = (ids) => {
        mutationDeleteMany.mutate({ids: ids, token: user?.access_token}, {
            onSettled: () => {
                queryProduct.refetch()
            }
        })
    }

    const fetchAllTypeProduct = async () => {
        const res = await ProductService.getAllTypeProduct()
        return res
    }

    const {data, isPending, isSuccess, isError} = mutation
    const {data: dataUpdated, isPending: isPendingUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated} = mutationUpdate
    const {data: dataDeleted, isPending: isPendingDeleted, isSuccess: isSuccessDeleted, isError: isErrorUDeleted} = mutationDelete
    const {data: dataDeletedMany, isPending: isPendingDeletedMany, isSuccess: isSuccessDeletedMany, isError: isErrorUDeletedMany} = mutationDeleteMany




    const queryProduct = useQuery({queryKey: ['product'], queryFn: getAllProducts})
    const typeProduct = useQuery({queryKey: ['type-product'], queryFn: fetchAllTypeProduct})
    const {isPending: isPendingProducts, data: products } = queryProduct
    const renderAction = () => {
        return (
            <div>
                <DeleteOutlined style={{color: 'red', fontSize: '30px', cursor: 'pointer'}} onClick={() => setisModalOpenDelete(true)}/>
                <EditOutlined style={{color: 'orange', fontSize: '30px', cursor: 'pointer'}} onClick={handleDetailsProduct}/>
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

    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            sorter: (a, b) => a.name.length - b.name.length,
            ...getColumnSearchProps('name')
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            sorter: (a, b) => a.price - b.price,
            filters: [
                {
                  text: '>= 50',
                  value: '>=',
                },
                {
                  text: '<= 50',
                  value: '<=',
                },
              ],
              onFilter: (value, record) => {
                if(value=== '>=' ) {
                    return record.price >=50
                }
                return record.price <=50
              },
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            sorter: (a, b) => a.rating - b.rating,
            filters: [
                {
                  text: '>= 3',
                  value: '>=',
                },
                {
                  text: '<= 3',
                  value: '<=',
                },
              ],
              onFilter: (value, record) => {
                if(value=== '>=' ) {
                    return Number(record.rating) >=3
                }
                return Number(record.rating) <=3
              },

        },
        {
            title: 'Kho hàng',
            dataIndex: 'countInStock',
        },
        {
            title: 'Loại sản phẩm',
            dataIndex: 'type',
        },
        {
            title: 'Màu sắc',
            dataIndex: 'colors',
        },
        {
            title: 'Kích thước',
            dataIndex: 'sizes',
        },
        {
            title: 'Tuỳ chọn',
            dataIndex: 'action',
            render: renderAction
        },
    ];

    const dataTable = products?.data?.length && products?.data?.map((product) => {
        return {...product, key: product._id}
    })

//create
    useEffect(() => {
        if(isSuccess && data?.status === 'OK') {
            message.success()
            handleCancel()
        } else if(isError){
            message.error()
        }
    }, [isSuccess])

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
        setStateProductDetails({
            name: '',
            price: '',
            description: '',
            rating: '',
            image: '',
            type: '',
            countInStock: '',
            discount: '',
            sizes: '',
            colors: ''
        })
        form.resetFields()

    }

    const handleCancelDelete = () => {
        setisModalOpenDelete(false)
    }

    const handleDeleteProduct = () => {
        mutationDelete.mutate({id: rowSelected, token: user?.access_token}, {
            onSettled: () => {
                queryProduct.refetch()
            }
        })
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        setStateProduct({
            name: '',
            price: '',
            description: '',
            rating: '',
            image: '',
            type: '',
            countInStock: '',
            discount: '',
            sizes: '',
            colors: ''
        })
        form.resetFields()

    }
    // const onFinish = () => {
    //     mutation.mutate(stateProduct, {
    //         onSettled: () => {
    //            queryProduct.refetch()
    //         }
    //     })
    // }
    const onFinish = () => {
        const params = {
            name: stateProduct.name,
            price: stateProduct.price,
            description: stateProduct.description,
            rating: stateProduct.rating,
            image: stateProduct.image,
            type: stateProduct.type === 'add_type' ? stateProduct.newType : stateProduct.type,
            countInStock: stateProduct.countInStock,
            discount: stateProduct.discount,
            sizes: stateProduct.sizes,
            colors: stateProduct.colors
        }
        mutation.mutate(params, {
            onSettled: () => {
                queryProduct.refetch();
                handleCancel(); 
            }
        });
    };
    
    const handleOnchange = (e) => {
        setStateProduct({
            ...stateProduct,
            [e.target.name]: e.target.value
        })
    }
    const handleOnchangeDetails = (e) => {
        setStateProductDetails({
            ...stateProductDetails,
            [e.target.name]: e.target.value
        })
    }
     const handleOnchangeAvatar = async({fileList}) => {
            const file = fileList[0]
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj)
            }
            setStateProduct({
                ...stateProduct,
                image: file.preview
            })
        }
        const handleOnchangeAvatarDetails = async({fileList}) => {
            const file = fileList[0]
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj)
            }
            setStateProductDetails({
                ...stateProductDetails,
                image: file.preview
            })
        }

        const onUpdateProduct = () => {
            mutationUpdate.mutate({id: rowSelected, token: user?.access_token, ...stateProductDetails}, {
                onSettled: () => {
                   queryProduct.refetch()
                }
            })
        }

        const handleChangeSelect = (value) => {            
            setStateProduct({
                ...stateProduct,
                type: value
            })
        }

       
        
  return (
    <div>
        <WrapperHeader>Quản lý sản phẩm</WrapperHeader>
        <div style={{marginTop: '10px'}}>
            <Button style={{height: '150px', width: '150px', borderRadius: '6px', borderStyle: 'dashed'}} onClick={() => setIsModalOpen(true)}><PlusOutlined style={{fontSize: '60px'}}/></Button>
        </div>
        <div style={{marginTop: '20px'}}>
            <TableComponent handleDeleteMany={handleDeleteManyProducts} columns={columns} isPending={isPendingProducts} data={dataTable}
                onRow={(record, rowIndex) => {
                    return {
                        onClick: even => {
                            setRowSelected(record._id)
                        }
                    }
                }}
            />
        </div>
        <ModalComponent forceRender title="Tạo sản phẩm " open={isModalOpen} onCancel={handleCancel} footer={null}>
            <Loading isPending={isPending}>
                <Form
                    name="basic"
                    labelCol={{
                        span: 6,
                    }}
                    wrapperCol={{
                        span: 18,
                    }}
                    onFinish={onFinish}
                    autoComplete="on"
                    form={form}
                >
                <Form.Item
                    label="Tên sản phẩm"
                    name="name"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your name!',
                    },
                    ]}
                >
                <InputComponent value={stateProduct.name} onChange={handleOnchange} name="name"/>
                </Form.Item>

                {/* <Form.Item
                label="Màu sắc"
                name="colors"
                rules={[
                    {
                    required: true,
                    message: 'Please select your color!',
                    },
                ]}
                >
                <Select
                    name="colors"
                    value={stateProduct.colors}
                    onChange={(value) => setStateProduct({ ...stateProduct, colors: value })}
                    options={[
                    ...renderOptions(['green', 'navy', 'darkslategray']),
                    { label: 'Thêm màu mới', value: 'add_color' }
                    ]}
                />
                </Form.Item>

                {stateProduct.colors === 'add_color' && (
                <Form.Item
                    label="Màu mới"
                    name="newColor"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your new color!',
                    },
                    ]}
                >
                    <InputComponent
                    value={stateProduct.newColor}
                    onChange={handleOnchange}
                    name="newColor"
                    />
                </Form.Item>
                )}

                {/* Kích thước */}
                {/* <Form.Item
                label="Kích thước"
                name="sizes"
                rules={[
                    {
                    required: true,
                    message: 'Please select your size!',
                    },
                ]}
                >
                <Select
                    name="sizes"
                    value={stateProduct.sizes}
                    onChange={(value) => setStateProduct({ ...stateProduct, sizes: value })}
                    options={[
                    ...renderOptions(['S', 'M', 'L', 'XL']),
                    { label: 'Thêm size mới', value: 'add_size' }
                    ]}
                />
                </Form.Item>

                {stateProduct.sizes === 'add_size' && (
                <Form.Item
                    label="Size mới"
                    name="newSize"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your new size!',
                    },
                    ]}
                >
                    <InputComponent
                    value={stateProduct.newSize}
                    onChange={handleOnchange}
                    name="newSize"
                    />
                </Form.Item>
                )} */} 
                
                <Form.Item
  label="Màu sắc"
  name="colors"
  rules={[
    {
      required: true,
      message: 'Please select your color!',
    },
  ]}
>
  <Select
    mode="multiple"
    allowClear
    value={stateProduct.colors}
    onChange={(value) => setStateProduct({ ...stateProduct, colors: value })}
    options={[
      ...renderOptions(['green', 'navy', 'darkslategray']),
      { label: 'Thêm màu mới', value: 'add_color' }
    ]}
  />
</Form.Item>

{stateProduct.colors?.includes('add_color') && (
  <Form.Item
    label="Màu mới"
    name="newColor"
    rules={[
      {
        required: true,
        message: 'Please input your new color!',
      },
    ]}
  >
    <InputComponent
      value={stateProduct.newColor}
      onChange={handleOnchange}
      name="newColor"
    />
  </Form.Item>
)}


                <Form.Item
  label="Kích thước"
  name="sizes"
  rules={[
    {
      required: true,
      message: 'Please select your size!',
    },
  ]}
>
  <Select
    mode="multiple"
    allowClear
    value={stateProduct.sizes}
    onChange={(value) => setStateProduct({ ...stateProduct, sizes: value })}
    options={[
      ...renderOptions(['S', 'M', 'L', 'XL']),
      { label: 'Thêm size mới', value: 'add_size' }
    ]}
  />
</Form.Item>

{stateProduct.sizes?.includes('add_size') && (
  <Form.Item
    label="Size mới"
    name="newSize"
    rules={[
      {
        required: true,
        message: 'Please input your new size!',
      },
    ]}
  >
    <InputComponent
      value={stateProduct.newSize}
      onChange={handleOnchange}
      name="newSize"
    />
  </Form.Item>
)}


                <Form.Item
                    label="Loại sản phẩm"
                    name="type"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Type!',
                    },
                    ]}
                >               
                    <Select 
                        name="type"
                        value={stateProduct.type}
                        onChange={handleChangeSelect}
                        options={renderOptions(typeProduct?.data?.data)}
                    />
                </Form.Item>
                {stateProduct.type === 'add_type' && (
                    <Form.Item
                        label='Loại mới'
                        name="newType"
                        rules={[
                        {
                            required: true,
                            message: 'Please input your Type!',
                        },
                        ]}
                    >                                       
                        <InputComponent value={stateProduct.newType} onChange={handleOnchange} name="newType"/>
                    </Form.Item>
                )}
                

                <Form.Item
                    label="Kho hàng"
                    name="countInStock"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your count inStock!',
                    },
                    ]}
                >
                <InputComponent value={stateProduct.countInStock} onChange={handleOnchange} name="countInStock"/>
                </Form.Item>

                <Form.Item
                    label="Giá"
                    name="price"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Price!',
                    },
                    ]}
                >
                <InputComponent value={stateProduct.price} onChange={handleOnchange} name="price"/>
                </Form.Item>

                <Form.Item
                    label="Giảm giá"
                    name="discount"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your discount of product!',
                    },
                    ]}
                >
                <InputComponent value={stateProduct.discount} onChange={handleOnchange} name="discount"/>
                </Form.Item>

                <Form.Item
                    label="Đánh giá"
                    name="rating"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Rating!',
                    },
                    ]}
                >
                <InputComponent value={stateProduct.rating} onChange={handleOnchange} name="rating"/>
                </Form.Item>

                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Description!',
                    },
                    ]}
                >
                <InputComponent value={stateProduct.description} onChange={handleOnchange} name="description"/>
                </Form.Item>

                <Form.Item
                    label="Hình ảnh"
                    name="image"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your image!',
                    },
                    ]}
                >
                    <WrapperUploadFile onChange={handleOnchangeAvatar} maxCount={1}>
                        <Button icon={<UploadOutlined />}>Select file</Button>
                        {stateProduct?.image && (
                        <img src={stateProduct?.image} style={{
                            height: '60px',
                            width: '60px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginLeft: '10px'
                        }} alt='image'/>
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
                    Submit
                </Button>
                </Form.Item>

                </Form>
            </Loading>
        </ModalComponent>

        <DrawerComponent title='Chi tiết sản phẩm' isOpen={isOpenDrawer} onClose={() => setIsOpenDrawer(false) } width="90%">
            <Loading isPending={isPendingUpdate || isPendingUpdated}>
                <Form
                    name="basic"
                    labelCol={{
                        span: 2,
                    }}
                    wrapperCol={{
                        span: 22,
                    }}
                    onFinish={onUpdateProduct}
                    autoComplete="on"
                    form={form}
                >
                <Form.Item
                    label="Tên sản phẩm"
                    name="name"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your name!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.name} onChange={handleOnchangeDetails} name="name"/>
                </Form.Item>

                <Form.Item
                    label="Màu sắc"
                    name="colors"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your colors!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.colors} onChange={handleOnchangeDetails} name="colors"/>
                </Form.Item>

                <Form.Item
                    label="Kích thước"
                    name="sizes"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your sizes!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.sizes} onChange={handleOnchangeDetails} name="sizes"/>
                </Form.Item>
                

                <Form.Item
                    label="Loại sản phẩm"
                    name="type"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Type!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.type} onChange={handleOnchangeDetails} name="type"/>
                </Form.Item>

                <Form.Item
                    label="Kho hàng"
                    name="countInStock"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your count inStock!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.countInStock} onChange={handleOnchangeDetails} name="countInStock"/>
                </Form.Item>

                <Form.Item
                    label="Giá"
                    name="price"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Price!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.price} onChange={handleOnchangeDetails} name="price"/>
                </Form.Item>

                <Form.Item
                    label="Giảm giá"
                    name="discount"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your discount of product!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.discount} onChange={handleOnchangeDetails} name="discount"/>
                </Form.Item>

                <Form.Item
                    label="Đánh giá"
                    name="rating"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Rating!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.rating} onChange={handleOnchangeDetails} name="rating"/>
                </Form.Item>

                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your Description!',
                    },
                    ]}
                >
                <InputComponent value={stateProductDetails.description} onChange={handleOnchangeDetails} name="description"/>
                </Form.Item>

                <Form.Item
                    label="Hình ảnh"
                    name="image"
                    rules={[
                    {
                        required: true,
                        message: 'Please input your image!',
                    },
                    ]}
                >
                    <WrapperUploadFile onChange={handleOnchangeAvatarDetails} maxCount={1}>
                        <Button icon={<UploadOutlined />}>Select file</Button>
                        {stateProductDetails?.image && (
                        <img src={stateProductDetails?.image} style={{
                            height: '60px',
                            width: '60px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginLeft: '10px'
                        }} alt='image'/>
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
                    Apply
                </Button>
                </Form.Item>

                </Form>
            </Loading>
        </ DrawerComponent>

        <ModalComponent forceRender title="Xoá sản phẩm " open={isModalOpenDelete} onCancel={handleCancelDelete} onOk={handleDeleteProduct}>
            <Loading isPending={isPendingDeleted}>
               <div>Bạn có chắc chắn muốn xoá sản phẩm?</div>
            </Loading>
        </ModalComponent>
    </div>
  )
}

export default AdminProduct