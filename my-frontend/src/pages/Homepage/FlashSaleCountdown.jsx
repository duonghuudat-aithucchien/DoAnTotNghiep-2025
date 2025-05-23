import React, { useEffect, useState } from 'react';

const FlashSaleCountdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const countdown = () => {
      const now = new Date().getTime();
      const distance = new Date(endTime).getTime() - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    countdown();
    const interval = setInterval(countdown, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div style={{ fontWeight: 'bold', fontSize: '18px', textAlign: 'center', marginBottom: '10px', color: '#f00' }}>
        Kết thúc sau: {`${timeLeft.hours.toString().padStart(2, '0')} : ${timeLeft.minutes.toString().padStart(2, '0')} : ${timeLeft.seconds.toString().padStart(2, '0')}`}
    </div>
  );
};

export default FlashSaleCountdown;
