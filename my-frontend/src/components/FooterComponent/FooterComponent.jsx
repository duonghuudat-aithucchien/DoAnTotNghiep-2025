import React, { useState } from 'react';
import {
    FooterContainer,
    NewsletterSection,
    InputWrapper,
    EmailInput,
    SubscribeButton,
    FooterContent,
    Column,
    ColumnTitle,
    LinkItem,
    SocialIcons,
    SocialIcon,
    LogoText,
    Description,
    BottomBar,
    Copyright,
    PaymentIcons,
    PaymentIcon,
} from './style';

import FacebookIcon from '../../assets/icons/FacebookIcon.svg';
import TwitterIcon from '../../assets/icons/TwitterIcon.svg';
import InstagramIcon from '../../assets/icons/InstagramIcon.svg';
import GithubIcon from '../../assets/icons/GithubIcon.svg';

import VisaIcon from '../../assets/icons/VisaIcon.svg';
import MastercardIcon from '../../assets/icons/MastercardIcon.svg';
import PaypalIcon from '../../assets/icons/PaypalIcon.svg';
import ApplePayIcon from '../../assets/icons/ApplePayIcon.svg';
import GooglePayIcon from '../../assets/icons/GooglePayIcon.svg';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubscribe = async () => {
        if (!email) {
            setMessage('Vui lòng nhập email');
            return;
        }

        try {
            const response = await fetch('/api/email/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Đăng ký thành công!');
                setEmail('');
            } else {
                setMessage(data.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            setMessage('Có lỗi xảy ra, vui lòng thử lại sau');
        }
    };

    return (
        <FooterContainer>
            <NewsletterSection>
                <h2>CẬP NHẬT TIN TỨC MỚI NHẤT CỦA CHÚNG TÔI</h2>
                <InputWrapper>
                    <EmailInput
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <SubscribeButton onClick={handleSubscribe}>
                        Đăng ký nhận thông tin
                    </SubscribeButton>
                </InputWrapper>
                {message && <p style={{ marginTop: '8px', color: '#fff' }}>{message}</p>}
            </NewsletterSection>

            <FooterContent>
                <Column>
                    <LogoText>Fashion Style</LogoText>
                    <Description>
                        Chúng tôi có những bộ quần áo phù hợp với phong cách của bạn và bạn tự hào khi mặc chúng. Từ phụ nữ đến nam giới.
                    </Description>
                    <SocialIcons>
                        <a href="#"><SocialIcon src={TwitterIcon} alt="Twitter" /></a>
                        <a href="#"><SocialIcon src={FacebookIcon} alt="Facebook" /></a>
                        <a href="#"><SocialIcon src={InstagramIcon} alt="Instagram" /></a>
                        <a href="https://github.com/duonghuudat/"><SocialIcon src={GithubIcon} alt="GitHub" /></a>
                    </SocialIcons>
                </Column>

                <Column>
                    <ColumnTitle>Công ty</ColumnTitle>
                    <LinkItem href="#">Giới thiệu</LinkItem>
                    <LinkItem href="#">Tính năng</LinkItem>
                    <LinkItem href="#">Cách hoạt động</LinkItem>
                    <LinkItem href="#">Nghề nghiệp</LinkItem>
                </Column>

                <Column>
                    <ColumnTitle>Hỗ trợ</ColumnTitle>
                    <LinkItem href="#">Hỗ trợ khách hàng</LinkItem>
                    <LinkItem href="#">Chi tiết giao hàng</LinkItem>
                    <LinkItem href="#">Điều khoản & Điều kiện</LinkItem>
                    <LinkItem href="#">Chính sách bảo mật</LinkItem>
                </Column>

                <Column>
                    <ColumnTitle>Câu hỏi thường gặp</ColumnTitle>
                    <LinkItem href="#">Tài khoản</LinkItem>
                    <LinkItem href="#">Quản lý giao hàng</LinkItem>
                    <LinkItem href="#">Đơn hàng</LinkItem>
                    <LinkItem href="#">Thanh toán</LinkItem>
                </Column>

                <Column>
                    <ColumnTitle>Tài nguyên</ColumnTitle>
                    <LinkItem href="#">Sách điện tử miễn phí</LinkItem>
                    <LinkItem href="#">Hướng dẫn phát triển</LinkItem>
                    <LinkItem href="#">Blog hướng dẫn</LinkItem>
                    <LinkItem href="#">Danh sách phát Youtube</LinkItem>
                </Column>
            </FooterContent>

            <BottomBar>
                <Copyright>
                    Fashion Style © Since-2025, All Rights Reserved
                </Copyright>
                <PaymentIcons>
                    <PaymentIcon src={VisaIcon} alt="Visa" />
                    <PaymentIcon src={MastercardIcon} alt="Mastercard" />
                    <PaymentIcon src={PaypalIcon} alt="PayPal" />
                    <PaymentIcon src={ApplePayIcon} alt="Apple Pay" />
                    <PaymentIcon src={GooglePayIcon} alt="Google Pay" />
                </PaymentIcons>
            </BottomBar>
        </FooterContainer>
    );
};

export default Footer;
