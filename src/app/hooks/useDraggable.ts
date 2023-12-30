import { useEffect, RefObject } from 'react';

const useDraggable = (containerRef: RefObject<HTMLElement>, movingState: {moving: boolean, Xoffset: number, Yoffset: number}, setMovingState: Function, targetClass: string, excludeClass: string) => {
  useEffect(() => {
    const startMove = (event: {target: any, clientX: number, clientY: number}) => {
      if (!movingState.moving && event.target.classList.contains(targetClass) && 
          !(event.target.classList.contains(excludeClass)) && 
          containerRef.current !== null) {
        setMovingState({
          moving: true, 
          Yoffset: event.clientY - containerRef.current.getBoundingClientRect().top, 
          Xoffset: event.clientX - containerRef.current.getBoundingClientRect().left
        });
      }
    };

    const move = (event: {target: any, clientX: number, clientY: number}) => {
      if (movingState.moving && containerRef.current !== null) {
        containerRef.current.style.transform = 'none';
        containerRef.current.style.top = `${event.clientY - movingState.Yoffset}px`;
        containerRef.current.style.left = `${event.clientX - movingState.Xoffset}px`;
      }
    };

    const endMove = (event: {target: any, clientX: number, clientY: number}) => {
      if (movingState.moving) {
        setMovingState({moving: false, Xoffset: 0, Yoffset: 0});
        if (containerRef.current !== null) {
          const docSize = document.documentElement.getBoundingClientRect();
          const newTop = event.clientY - movingState.Yoffset;
          const newLeft = event.clientX - movingState.Xoffset;
          adjustPosition(containerRef.current, newTop, newLeft, docSize);
        }
      }
    };

    document.addEventListener('mousedown', startMove);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', endMove);

    return () => {
      document.removeEventListener('mousedown', startMove);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', endMove);
    };
  }, [movingState]);
};

const adjustPosition = (element: any, newTop: number, newLeft: number, docSize: DOMRect) => {
  if (newTop < 0) {
    element.style.top = '0px';
  } else if (newTop + element.clientHeight > docSize.height) {
    element.style.top = `${docSize.height - element.clientHeight - 5}px`;
  }
  if (newLeft < 0) {
    element.style.left = '0px';
  } else if (newLeft + element.clientWidth > docSize.width) {
    element.style.left = `${docSize.width - element.clientWidth - 5}px`;
  }
};

export default useDraggable;
