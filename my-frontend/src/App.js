import React, { Fragment, Suspense, useEffect, useCallback, useState } from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import DefaultComponent from './components/DefaultComponent/DefaultComponent'
import { routes } from './routes/index'
import { isJsonString } from './utils'
import { useDispatch, useSelector } from 'react-redux'
import { jwtDecode } from 'jwt-decode';
import * as UserSerVice from './service/UserService'
import { updateUser } from './redux/slides/userSlide'
import Loading from './components/LoadingComponent/Loading'
import ChatbotWidget from "./components/Chatbot/ChatbotWidget";
import Footer from './components/FooterComponent/FooterComponent'
import { Navigate } from 'react-router-dom';
import { loadCartFromLocal } from './redux/slides/orderSlide';

// import axios from 'axios';
// import { useQuery } from '@tanstack/react-query';

function App() {
  const dispatch = useDispatch()
  const [isPending, setIspending] = useState(false)
  const user = useSelector((state) => state.user)
  const [isReady, setIsReady] = useState(false);

  

  // const handleDecoded = () => {
  //   let storageData = localStorage.getItem('access_token')
  //   //let decoded ={}
  //   if (storageData && isJsonString(storageData)) {
  //     storageData = JSON.parse(storageData)
  //     const decoded = jwtDecode(storageData)
  //     if(decoded?.id) {
  //       handleGetDetailsUser(decoded?.id, storageData)
  //       }
  //   }
  // }

  const handleDecoded = useCallback(() => {
    let storageData = localStorage.getItem('access_token');
    // let storageData = sessionStorage.getItem('access_token');
    if (!storageData || !isJsonString(storageData)) {
      return { storageData: null, decoded: null };
    }
  
    storageData = JSON.parse(storageData);
    try {
      const decoded = jwtDecode(storageData);
      return { storageData, decoded };
    } catch (error) {
      console.error("Lỗi khi decode JWT:", error);
      return { storageData: null, decoded: null };
    }
  }, []);
  

  const handleGetDetailsUser = useCallback(
    async (id, token) => {
      setIspending(true); // Bắt đầu loading
      try {
        const res = await UserSerVice.getDetailsUser(id, token);
        dispatch(updateUser({ ...res?.data, access_token: token }));
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      } finally {
        setIspending(false); // Dừng loading sau khi API hoàn thành
      }
    },
    [dispatch]
  );
  

  // useEffect(() => {
  //   setIspending(true)
  //   const { storageData, decoded } = handleDecoded()
  //   if (decoded?.id) {
  //     handleGetDetailsUser(decoded?.id, storageData)
  //   } else {
  //     setIspending(false);
  //   }
  // }, [handleDecoded, handleGetDetailsUser])
  useEffect(() => {
  const { storageData, decoded } = handleDecoded();
  if (decoded?.id) {
    dispatch(loadCartFromLocal(decoded.id));
    handleGetDetailsUser(decoded.id, storageData).finally(() => {
      setIsReady(true); // ✅ sau khi get xong thì cho phép render routes
    });
  } else {
    dispatch(loadCartFromLocal(null));
    setIsReady(true); // ✅ vẫn render nếu không có token
  }
}, [handleDecoded, handleGetDetailsUser, dispatch]);

  

  useEffect(() => {
    const interceptorId = UserSerVice.axiosJWT.interceptors.request.use(async (config) => {
      const currentTime = Date.now() / 1000;
      const { decoded } = handleDecoded();
      if (decoded?.exp && decoded.exp < currentTime) {
        const data = await UserSerVice.refreshToken();
        if (data?.access_token) {
          localStorage.setItem('access_token', JSON.stringify(data.access_token));
          config.headers.token = `Bearer ${data.access_token}`;
        }
      }
      return config;
    }, (error) => Promise.reject(error));

    return () => UserSerVice.axiosJWT.interceptors.request.eject(interceptorId);
  }, [handleDecoded]);


  //console.log('process.env.REACT_API_URL_BACKEND', process.env.REACT_APP_API_URL)

  // const fetchApi = async () => {
  //   const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-all`)
  //   return res.data
  // }

  // const query = useQuery({queryKey: ['todos'], queryFn: fetchApi})
  // console.log('query', query)

  return (
  <div style={{ height: '100vh', width: '100%' }}>
    <Loading isPending={isPending} style={{ background: '#ccc' }}>
      <Router>
  {isReady ? (
    <Suspense fallback={<Loading isPending={true} />}>
    <Routes>
      {routes.map((route) => {
        const Page = route.page;
        const Layout = route.isShowHeader ? DefaultComponent : Fragment;
        const isAdminRoute = route.isPrivate;
        const isAdmin = user?.isAdmin === true || user?.isAdmin === 'true';
        const allowAccess = !isAdminRoute || isAdmin;

        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              allowAccess ? (
                <Layout>
                  <Page />
                  {route.isShowFooter && <Footer />}
                </Layout>
              ) : (
                <Navigate to="/not-found" replace />
              )
            }
          />
        );
      })}
    </Routes>
    </Suspense>
  ) : (
    <Loading isPending={true} />
  )}
</Router>


    </Loading>
    <ChatbotWidget />
  </div>
);

}

export default App
