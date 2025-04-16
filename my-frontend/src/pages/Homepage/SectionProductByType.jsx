import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as ProductService from '../../service/ProductService';
import { WrapperProducts, WrapperButtonMore, SectionTitle, WrapperSection } from './style';
import CardComponent from '../../components/CardComponent/CardComponent';

const SectionProductByType = ({ type }) => {
  const [limit, setLimit] = useState(6);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products-by-type', type, limit],
    queryFn: () => ProductService.getProductByType(type, limit),
    keepPreviousData: true,
  });

  const products = data?.data || [];

  return (
    <WrapperSection>
      <SectionTitle>{type}</SectionTitle>
      <WrapperProducts>
        {products.map((product) => (
          <CardComponent key={product._id} {...product} />
        ))}
      </WrapperProducts>
      {products.length >= limit && (
        <WrapperButtonMore
          textButton={isFetching ? 'Đang tải...' : 'Xem thêm'}
          type="outline"
          onClick={() => setLimit((prev) => prev + 6)}
          disabled={isFetching}
          styleButton={{
            background: '#fff',
          }}
          styleTextButton={{
            fontWeight: '500',
            color: '#000',
          }}
        />
      )}
    </WrapperSection>
  );
};

export default SectionProductByType;
