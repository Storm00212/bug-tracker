/**
 * MAIN CONTENT COMPONENT
 *
 * Provides the main content area for page components.
 * Includes proper spacing to account for the fixed header.
 * Contains parallax background effects and responsive padding.
 */

import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { gsap } from 'gsap';

const MainContent: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  // GSAP animations for main content
  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
      );
    }

    // Add parallax effect to background elements
    gsap.set('.parallax-bg', { y: 0 });
    gsap.to('.parallax-bg', {
      y: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.main-content',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }, []);

  return (
    <main
      ref={mainRef}
      className="pt-20 min-h-screen parallax-bg main-content"
    >
      <div className="p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default MainContent;