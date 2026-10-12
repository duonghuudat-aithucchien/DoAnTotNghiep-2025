import React, { useMemo, useState } from 'react';
import { Alert, Empty, Input, Pagination, Select, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import CardComponent from '../../components/CardComponent/CardComponent';
import * as ProductService from '../../service/ProductService';

const PAGE_SIZE = 12;

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const productsQuery = useQuery({
    queryKey: ['products', 'catalog'],
    queryFn: () => ProductService.getAllProduct('', 9999),
  });
  const typesQuery = useQuery({
    queryKey: ['products', 'types'],
    queryFn: ProductService.getAllTypeProduct,
  });

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('vi');
    const items = [...(productsQuery.data?.data || [])].filter((product) => {
      const matchesSearch = !normalizedSearch ||
        `${product.name} ${product.description || ''}`.toLocaleLowerCase('vi').includes(normalizedSearch);
      return matchesSearch && (type === 'all' || product.type === type);
    });

    return items.sort((left, right) => {
      if (sort === 'price-asc') return left.price - right.price;
      if (sort === 'price-desc') return right.price - left.price;
      if (sort === 'popular') return (right.selled || 0) - (left.selled || 0);
      return new Date(right.createdAt) - new Date(left.createdAt);
    });
  }, [productsQuery.data, search, type, sort]);

  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <main style={{ maxWidth: 1270, margin: '0 auto', padding: '32px 16px 64px' }}>
      <h1 style={{ marginBottom: 8 }}>Tất cả sản phẩm</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Khám phá và lọc các sản phẩm phù hợp với phong cách của bạn.</p>

      <section aria-label="Bộ lọc sản phẩm" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <Input.Search
          aria-label="Tìm kiếm sản phẩm"
          allowClear
          placeholder="Tìm theo tên hoặc mô tả"
          onSearch={changeFilter(setSearch)}
          onChange={(event) => !event.target.value && changeFilter(setSearch)('')}
          style={{ flex: '1 1 280px' }}
        />
        <Select
          aria-label="Lọc theo loại"
          value={type}
          loading={typesQuery.isPending}
          onChange={changeFilter(setType)}
          style={{ minWidth: 180 }}
          options={[
            { value: 'all', label: 'Tất cả loại' },
            ...(typesQuery.data?.data || []).map((item) => ({ value: item, label: item })),
          ]}
        />
        <Select
          aria-label="Sắp xếp sản phẩm"
          value={sort}
          onChange={changeFilter(setSort)}
          style={{ minWidth: 190 }}
          options={[
            { value: 'newest', label: 'Mới nhất' },
            { value: 'popular', label: 'Bán chạy' },
            { value: 'price-asc', label: 'Giá thấp đến cao' },
            { value: 'price-desc', label: 'Giá cao đến thấp' },
          ]}
        />
      </section>

      {productsQuery.isError && <Alert type="error" showIcon message="Không thể tải danh sách sản phẩm" />}
      {productsQuery.isPending ? (
        <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}><Spin size="large" /></div>
      ) : visibleProducts.length ? (
        <>
          <section aria-live="polite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
            {visibleProducts.map((product) => <CardComponent key={product._id} {...product} id={product._id} />)}
          </section>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={filteredProducts.length}
            onChange={setPage}
            showSizeChanger={false}
            style={{ marginTop: 36, display: 'flex', justifyContent: 'center' }}
          />
        </>
      ) : <Empty description="Không tìm thấy sản phẩm phù hợp" />}
    </main>
  );
};

export default ProductsPage;
