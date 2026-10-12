import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/Homepage/Homepage'));
const OrderPage = lazy(() => import('../pages/OrderPage/OrderPage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage/ProductsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage'));
const TypeProductPage = lazy(() => import('../pages/TypeProductPage/TypeProductPage'));
const TopSellingPage = lazy(() => import('../pages/TypeProductPage/TopSellingPage'));
const TopNewPage = lazy(() => import('../pages/TypeProductPage/TopNewPage'));
const SignInPage = lazy(() => import('../pages/SignInPage/SignInPage'));
const SignUpPage = lazy(() => import('../pages/SignUpPage/SignUpPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage/ProductDetailPage'));
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AdminPage = lazy(() => import('../pages/AdminPage/AdminPage'));
const PaymentPage = lazy(() => import('../pages/PaymentPage/PaymentPage'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess/OrderSuccess'));
const MyOrderPage = lazy(() => import('../pages/MyOrderPage/MyOrderPage'));
const DetailsOrderPage = lazy(() => import('../pages/DetailsOrderPage/DetailsOrderPage'));


export const routes = [
    {
        path: '/',
        page: HomePage,
        isShowHeader: true,
        isShowFooter: true
    },
    {
        path: '/order',
        page: OrderPage,
        isShowHeader: true,
        isShowFooter: true


    },
    {
        path: '/my-order',
        page: MyOrderPage,
        isShowHeader: true,
        isShowFooter: true


    },
    {
        path: '/details-order/:id',
        page: DetailsOrderPage,
        isShowHeader: true,
        isShowFooter: true


    },
    {
        path: '/payment',
        page: PaymentPage,
        isShowHeader: true,
        isShowFooter: true


    },
    {
        path: '/orderSuccess',
        page: OrderSuccess,
        isShowHeader: true,
        isShowFooter: true


    },
    {
        path: '/products',
        page: ProductsPage,
        isShowHeader: true,
        isShowFooter: true

    },
    {
        path: 'product/:type',
        page: TypeProductPage,
        isShowHeader: true,
        isShowFooter: true

    },
    {
        path: '/top-selling',
        page: TopSellingPage,
        isShowHeader: true,
        isShowFooter: true
    },
    {
        path: '/top-new',
        page: TopNewPage,
        isShowHeader: true,
        isShowFooter: true
    },
    {
        path: '/sign-in',
        page: SignInPage,
        isShowHeader: false
    },
    {
        path: '/sign-up',
        page: SignUpPage,
        isShowHeader: false
    },
    {
        path: '/product-details/:id',
        page: ProductDetailPage,
        isShowHeader: true,
        isShowFooter: true

    },
    {
        path: '/profile-user',
        page: ProfilePage,
        isShowHeader: true
    },
    {
        path: '/system/admin',
        page: AdminPage,
        isShowHeader: false,
        isPrivate: true
    },
    {
        path: '*',
        page: NotFoundPage,
        isShowHeader: false
    }
];
