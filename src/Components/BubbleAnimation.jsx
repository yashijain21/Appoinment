// components/BubbleBackground.jsx
import React, { useEffect } from "react";
import { gsap } from "gsap";

const BubbleBackground = () => {
  useEffect(() => {
    const bubbles = gsap.utils.toArray(".bubble");

    bubbles.forEach((bubble) => {
      const duration = 3 + Math.random() * 3;
      const delay = Math.random() * 2;
      const yDistance = 50 + Math.random() * 50;

      gsap.to(bubble, {
        y: `-=${yDistance}`,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay,
      });

      if (Math.random() > 0.5) {
        gsap.to(bubble, {
          x: `+=${30 + Math.random() * 40}`,
          duration: duration * 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: delay,
        });
      }
    });
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {[...Array(15)].map((_, i) => {
        const size = 10 + Math.random() * 30;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const opacity = 0.05 + Math.random() * 0.2;
        const color = Math.random() > 0.5 ? "bg-primary" : "bg-secondary";
        const blur = Math.random() > 0.7 ? "blur-sm" : "";

        return (
          <span
            key={i}
            className={`bubble ${color} ${blur} rounded-full absolute`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${top}%`,
              left: `${left}%`,
              opacity: opacity,
            }}
          />
        );
      })}
    </div>
  );
};

export default BubbleBackground;
