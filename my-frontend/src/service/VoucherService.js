import axios from 'axios';

export const axiosJWT = axios.create();

export const applyVoucher = async (code, itemsPrice) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/voucher/apply`,
    { code, itemsPrice }
  );
  return res.data;
};

export const getAvailableVouchers = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/voucher/available`
  );
  return res.data;
};

export const getAllVouchers = async (access_token, limit = 50, page = 0) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/voucher/get-all?limit=${limit}&page=${page}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const createVoucher = async (data, access_token) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/voucher/create`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const updateVoucher = async (id, data, access_token) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/voucher/update/${id}`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

export const deleteVoucher = async (id, access_token) => {
  const res = await axios.delete(
    `${process.env.REACT_APP_API_URL}/voucher/delete/${id}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};
