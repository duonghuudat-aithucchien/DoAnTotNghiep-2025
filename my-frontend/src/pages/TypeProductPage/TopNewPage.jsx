import React, { useEffect, useState } from 'react';
import { Col, Pagination, Row, Typography } from 'antd';
import { useSelector } from 'react-redux';

import NavbarTopProductComponent from '../../components/NavbarComponent/NavbarTopProductComponent';
import CardComponent from '../../components/CardComponent/CardComponent';
import Loading from '../../components/LoadingComponent/Loading';

import { getFilteredProducts } from '../../service/FilterService';
import { useDebounce } from '../../hooks/useDebounce';

import {
  WrapperNavbar,
  WrapperProducts,
  WrapperHeader,
  WrapperTopBar,
} from './style';

const { Title } = Typography;

const TopNewPage = () => {
  const searchProduct = useSelector((state) => state?.product?.search);
  const searchDebounce = useDebounce(searchProduct, 500);

  const [products, setProducts] = useState([]);
  const [pending, setPending] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  const [panigate, setPanigate] = useState({
    page: 0,
    limit: 12,
    total: 1,
  });

  const fetchProducts = async (filters, page, limit) => {
    setPending(true);
    try {
      const sort =
        filters?.sort === 'asc' || filters?.sort === 'desc'
          ? filters.sort
          : 'createdAt';

      const res = await getFilteredProducts(filters || {}, page, limit, sort);
      if (res?.status === 'OK') {
        setProducts(res.data);
        setPanigate((prev) => ({ ...prev, total: res.totalPage }));
      }
    } catch (error) {
      console.error('Lỗi khi fetch top new:', error);
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeFilters, panigate.page, panigate.limit);
  }, [activeFilters, panigate.page, panigate.limit]);

  const onChange = (current, pageSize) => {
    setPanigate({ page: current - 1, limit: pageSize });
  };

  const filteredProducts = products.filter(
    (pro) =>
      searchDebounce === '' ||
      pro?.name.toLowerCase().includes(searchDebounce.toLowerCase())
  );

  return (
    <Loading isPending={pending}>
      <div style={{ width: '100%', background: '#f9f9f9', padding: '20px 0' }}>
        <div style={{ maxWidth: '1270px', margin: '0 auto', padding: '0 16px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={6} lg={5}>
              <WrapperNavbar>
                <NavbarTopProductComponent
                  mode="top-new"
                  setFilters={setActiveFilters}
                />
              </WrapperNavbar>
            </Col>

            <Col xs={24} md={18} lg={19} style={{ display: 'flex', flexDirection: 'column' }}>
              <WrapperHeader>
                <Title level={3} style={{ margin: 0 }}>Sản Phẩm Mới</Title>
                <WrapperTopBar>
                  <span>
                    Hiển thị {filteredProducts.length} sản phẩm
                  </span>
                </WrapperTopBar>
              </WrapperHeader>

              <WrapperProducts>
                <Row gutter={[16, 24]}>
                  {filteredProducts.map((product) => (
                    <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                      <CardComponent {...product} id={product._id} />
                    </Col>
                  ))}
                </Row>
              </WrapperProducts>

              <Pagination
                current={panigate.page + 1}
                total={panigate.total * panigate.limit}
                pageSize={panigate.limit}
                onChange={onChange}
                style={{ textAlign: 'center', marginTop: '30px' }}
              />
            </Col>
          </Row>
        </div>
      </div>
    </Loading>
  );
};

export default TopNewPage;
