import styled from 'styled-components';

export const FooterContainer = styled.footer`
    width: 100%;
    background-color: #f0f0f0;
    padding: 60px 40px 20px; // tăng padding trái phải
    font-family: 'Inter', sans-serif;
    color: #000;
`;
export const NewsletterSection = styled.div`
    background-color: #000;
    color: #fff;
    padding: 40px 30px;
    border-radius: 20px;
    text-align: center;
    max-width: 1320px; // tăng max width
    margin: 0 auto 50px;

    h2 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 24px;
    }

    @media (max-width: 768px) {
        h2 {
            font-size: 20px;
        }
    }
`;

export const InputWrapper = styled.div`
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
`;

export const EmailInput = styled.input`
    padding: 12px 20px;
    border-radius: 50px;
    border: none;
    width: 300px;
    font-size: 14px;
    color: black;
`;

export const SubscribeButton = styled.button`
    padding: 12px 20px;
    background-color: #fff;
    color: #000;
    border-radius: 50px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
        background-color: #eaeaea;
    }
`;

export const FooterContent = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-width: 1320px; // tăng max width
    margin: 0 auto;
    gap: 40px;
`;

export const Column = styled.div`
    flex: 1;
    min-width: 180px;
`;

export const LogoText = styled.h3`
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
`;

export const Description = styled.p`
    font-size: 14px;
    line-height: 1.6;
    color: #555;
    margin-bottom: 16px;
`;

export const ColumnTitle = styled.h4`
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 12px;
    text-transform: uppercase;
`;

export const LinkItem = styled.a`
    display: block;
    font-size: 14px;
    color: #555;
    margin-bottom: 8px;
    text-decoration: none;

    &:hover {
        color: #000;
    }
`;

export const SocialIcons = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 12px;
`;

export const SocialIcon = styled.img`
    width: 24px;
    height: 24px;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
`;

export const BottomBar = styled.div`
    border-top: 1px solid #ddd;
    margin-top: 40px;
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    max-width: 1320px; // tăng max width
    margin: 40px auto 0;
    align-items: center;
`;

export const Copyright = styled.p`
    font-size: 12px;
    color: #777;
`;

export const PaymentIcons = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
`;

export const PaymentIcon = styled.img`
    width: 40px;
    height: auto;
`;
