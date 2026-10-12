import axios from "axios";

export const subscribeEmail = async (email) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/email/subscribe`, { email });
    return res.data;
};
