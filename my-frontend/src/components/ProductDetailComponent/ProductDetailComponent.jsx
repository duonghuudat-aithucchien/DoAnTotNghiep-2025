import React, { useEffect, useMemo, useState } from 'react';
import { Col, Row, Image, Rate } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { WrapperStyleNameProduct, WrapperStyleTextSell, WrapperPriceProduct, WrapperPriceTextProduct, WrapperQualityProduct, WrapperInputNumber } from './style';
import ButtonComponent from '../ButtonComponent/ButtonComponent';
import Loading from '../LoadingComponent/Loading';
import * as ProductService from '../../service/ProductService';
import { addOrderProduct, resetOrder } from '../../redux/slides/orderSlide';
import convertPrice from '../../utils';
import * as message from '../Message/Message';

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const ProductDetailComponent = ({ idProduct }) => {
  const [amount, setAmount] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [stockError, setStockError] = useState(false);
  const order = useSelector((state) => state.order);
  const dispatch = useDispatch();

  const { isPending, data: product } = useQuery({
    queryKey: ['product-details', idProduct],
    queryFn: async ({ queryKey }) => (await ProductService.getDetailsProduct(queryKey[1])).data,
    enabled: Boolean(idProduct),
  });

  const variants = useMemo(
    () => (product?.variants || []).filter((variant) => variant.isActive !== false),
    [product]
  );
  const hasVariants = variants.length > 0;
  const colors = hasVariants ? unique(variants.map((variant) => variant.color)) : asArray(product?.colors);
  const sizes = hasVariants
    ? unique(variants.filter((variant) => !selectedColor || variant.color === selectedColor).map((variant) => variant.size))
    : asArray(product?.sizes);
  const selectedVariant = variants.find((variant) => variant.size === selectedSize && variant.color === selectedColor);
  const currentStock = Number(selectedVariant?.stock ?? (hasVariants ? 0 : product?.countInStock || 0));
  const currentPrice = Number(selectedVariant?.price ?? product?.price ?? 0);

  useEffect(() => {
    if (product?.image) setSelectedImage(product.image);
  }, [product]);

  useEffect(() => {
    if (selectedVariant?.image) setSelectedImage(selectedVariant.image);
    setAmount(1);
    setStockError(false);
  }, [selectedVariant]);

  useEffect(() => {
    if (order.isSuccessOrder) message.success('Thêm sản phẩm vào giỏ hàng thành công');
    return () => dispatch(resetOrder());
  }, [order.isSuccessOrder, dispatch]);

  const selectColor = (color) => {
    setSelectedColor(color);
    if (hasVariants && !variants.some((variant) => variant.color === color && variant.size === selectedSize)) {
      setSelectedSize('');
    }
  };

  const addToCart = () => {
    if ((sizes.length && !selectedSize) || (colors.length && !selectedColor)) {
      message.error('Vui lòng chọn kích thước và màu sắc');
      return;
    }
    if (hasVariants && !selectedVariant) {
      message.error('Biến thể đã chọn không tồn tại');
      return;
    }
    const existing = order.orderItems.find((item) => item.product === product?._id && (
      selectedVariant ? item.variantId === selectedVariant._id : item.size === selectedSize && item.color === selectedColor
    ));
    if (currentStock < 1 || Number(existing?.amount || 0) + amount > currentStock) {
      setStockError(true);
      return;
    }
    dispatch(addOrderProduct({
      orderItem: {
        name: product.name,
        amount,
        image: selectedVariant?.image || product.image,
        price: currentPrice,
        product: product._id,
        variantId: selectedVariant?._id,
        sku: selectedVariant?.sku || '',
        discount: product.discount || 0,
        countInStock: currentStock,
        description: product.description,
        size: selectedSize,
        color: selectedColor,
        sizes: selectedSize,
        colors: selectedColor,
      },
    }));
    setStockError(false);
  };

  const images = unique([product?.image, ...(product?.subImages || []), ...variants.map((variant) => variant.image)]);
  const finalPrice = currentPrice - (Number(product?.discount || 0) * currentPrice) / 100;

  return (
    <Loading isPending={isPending}>
      <Row style={{ padding: 16, background: '#fff', borderRadius: 4 }}>
        <Col xs={24} md={10}>
          <Row style={{ display: 'flex', gap: 24 }}>
            <div style={{ width: 80, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {images.map((image) => (
                <div key={image} onClick={() => setSelectedImage(image)} style={{ border: selectedImage === image ? '2px solid #000' : '1px solid #e5e5e5', borderRadius: 8, padding: 4, cursor: 'pointer' }}>
                  <Image src={image} alt="Ảnh sản phẩm" preview={false} style={{ borderRadius: 4, width: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <Image src={selectedImage || product?.image} alt={product?.name} style={{ borderRadius: 12, width: '100%', objectFit: 'contain', background: '#f9f9f9', padding: 12 }} />
            </div>
          </Row>
        </Col>

        <Col xs={24} md={14} style={{ paddingLeft: 16 }}>
          <WrapperStyleNameProduct>{product?.name}</WrapperStyleNameProduct>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }}>
            <Rate allowHalf value={product?.rating} disabled style={{ fontSize: 16 }} />
            <WrapperStyleTextSell>| Đã bán: {product?.selled || 0}</WrapperStyleTextSell>
          </div>
          <WrapperPriceProduct style={{ margin: '16px 0' }}>
            <WrapperPriceTextProduct style={{ fontSize: 28, color: '#ff424e', fontWeight: 600 }}>{convertPrice(finalPrice)}</WrapperPriceTextProduct>
            {product?.discount > 0 && <><span style={{ marginLeft: 12, textDecoration: 'line-through', color: '#999' }}>{convertPrice(currentPrice)}</span><span style={{ marginLeft: 8, color: '#f5222d' }}>-{product.discount}%</span></>}
          </WrapperPriceProduct>
          <p>{product?.description}</p>

          {colors.length > 0 && <div style={{ margin: '24px 0' }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Chọn màu sắc</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{colors.map((color) => (
              <button key={color} onClick={() => selectColor(color)} style={{ padding: '7px 14px', borderRadius: 20, border: selectedColor === color ? '2px solid #000' : '1px solid #ccc', background: selectedColor === color ? '#000' : '#fff', color: selectedColor === color ? '#fff' : '#000', cursor: 'pointer' }}>{color}</button>
            ))}</div>
          </div>}

          {sizes.length > 0 && <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Chọn kích thước</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{sizes.map((size) => {
              const available = !hasVariants || variants.some((variant) => variant.color === selectedColor && variant.size === size && variant.stock > 0);
              return <button key={size} disabled={!available} onClick={() => setSelectedSize(size)} style={{ padding: '8px 16px', borderRadius: 20, border: selectedSize === size ? '2px solid #000' : '1px solid #ccc', background: selectedSize === size ? '#000' : '#fff', color: selectedSize === size ? '#fff' : '#000', opacity: available ? 1 : 0.4, cursor: available ? 'pointer' : 'not-allowed' }}>{size}</button>;
            })}</div>
          </div>}

          <div style={{ margin: '20px 0', padding: '10px 0', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ marginBottom: 10 }}>Số lượng — còn {currentStock} sản phẩm</div>
            <WrapperQualityProduct>
              <button disabled={amount <= 1} onClick={() => setAmount((value) => Math.max(1, value - 1))}><MinusOutlined /></button>
              <WrapperInputNumber min={1} max={Math.max(1, currentStock)} value={amount} onChange={(value) => setAmount(Number(value || 1))} size="small" />
              <button disabled={amount >= currentStock} onClick={() => setAmount((value) => Math.min(currentStock, value + 1))}><PlusOutlined /></button>
            </WrapperQualityProduct>
          </div>

          <ButtonComponent size={40} styleButton={{ background: '#000', height: 48, width: 220, border: 'none', borderRadius: 4 }} onClick={addToCart} textButton="Thêm vào giỏ hàng" styleTextButton={{ color: '#fff', fontSize: 15, fontWeight: 700 }} />
          {stockError && <div style={{ color: 'red', marginTop: 8 }}>Số lượng vượt quá tồn kho của biến thể</div>}
        </Col>
      </Row>
    </Loading>
  );
};

export default ProductDetailComponent;
