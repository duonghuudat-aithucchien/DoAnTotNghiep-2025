import React, { useRef, useEffect } from 'react';
import { WrapperProducts, ArrowButton } from './style';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductScrollWithMomentum = ({ children }) => {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const momentumID = useRef(null);

  const applyMomentum = () => {
    if (Math.abs(velocity.current) < 0.5) return;
    scrollRef.current.scrollLeft += velocity.current;
    velocity.current *= 0.95;
    momentumID.current = requestAnimationFrame(applyMomentum);
  };

  const stopMomentum = () => {
    if (momentumID.current) cancelAnimationFrame(momentumID.current);
  };

  useEffect(() => {
    const scrollArea = scrollRef.current;

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - scrollArea.offsetLeft;
      const delta = x - lastX.current;
      velocity.current = delta;
      scrollArea.scrollLeft = scrollLeft.current - (x - startX.current);
      lastX.current = x;
    };

    const stopDragging = () => {
      if (isDragging.current) {
        isDragging.current = false;
        scrollArea.classList.remove('dragging');
        applyMomentum();
      }
    };

    scrollArea.addEventListener('mousemove', handleMouseMove);
    scrollArea.addEventListener('mouseup', stopDragging);
    scrollArea.addEventListener('mouseleave', stopDragging);

    return () => {
      scrollArea.removeEventListener('mousemove', handleMouseMove);
      scrollArea.removeEventListener('mouseup', stopDragging);
      scrollArea.removeEventListener('mouseleave', stopDragging);
    };
  }, []);

  const handleMouseDown = (e) => {
    stopMomentum();
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    lastX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.classList.add('dragging');
  };

  const scrollBy = (direction) => {
    const distance = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <ArrowButton direction="left" onClick={() => scrollBy('left')}>
        <ChevronLeft size={20} />
      </ArrowButton>

      <WrapperProducts ref={scrollRef} onMouseDown={handleMouseDown}>
        {children}
      </WrapperProducts>

      <ArrowButton direction="right" onClick={() => scrollBy('right')}>
        <ChevronRight size={20} />
      </ArrowButton>
    </div>
  );
};

export default ProductScrollWithMomentum;
