import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function TransitionShell({ children }) {
  const contentRef = useRef(null);
  const indicatorRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    setActiveTab(path === '/about' ? 1 : 0);

    const isNavigating = window.sessionStorage.getItem('astro_page_transition');
    window.sessionStorage.removeItem('astro_page_transition');

    if (isNavigating) {
      // Navigating from another page, snap content into place.
      gsap.set(contentRef.current, { opacity: 1, x: 0 });
    } else {
      // Fresh load, animate in.
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: '30px' },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: 'power3.out',
        }
      );
    }

    // Pill indicator logic
    if (indicatorRef.current) {
      const tabs = indicatorRef.current.parentElement.querySelectorAll('.slider-tab');
      if (tabs.length > activeTab && tabs[activeTab]) {
        const tabRect = tabs[activeTab].getBoundingClientRect();
        const parentRect = tabs[activeTab].parentElement.getBoundingClientRect();
        gsap.set(indicatorRef.current, {
          width: tabRect.width,
          x: tabRect.left - parentRect.left,
        });
      }
    }
  }, []);

  // Animate nav indicator on tab change
  useEffect(() => {
    if (!indicatorRef.current) return;
    const tabs = indicatorRef.current.parentElement.querySelectorAll('.slider-tab');
    if (tabs.length > activeTab && tabs[activeTab]) {
      const tabRect = tabs[activeTab].getBoundingClientRect();
      const parentRect = tabs[activeTab].parentElement.getBoundingClientRect();
      gsap.to(indicatorRef.current, {
        width: tabRect.width,
        x: tabRect.left - parentRect.left,
        duration: 0.3, // Halved from 0.6 to double the speed
        ease: 'power4.inOut',
      });
    }
  }, [activeTab]);

  // Handle nav click - simple page navigation with GSAP transition
  function handleNav(idx, href) {
    return e => {
      e.preventDefault();
      if (activeTab === idx || isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      
      // By removing setActiveTab(idx) here, we prevent the first animation.
      // The animation will now only run once when the new page loads.
      
      window.sessionStorage.setItem('astro_page_transition', 'true');

      gsap.to(contentRef.current, {
        opacity: 0,
        x: '-30px',
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => {
          window.location.href = href;
        }
      });
    };
  }

  function handleHome(e) {
    e.preventDefault();
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    
    window.sessionStorage.setItem('astro_page_transition', 'true');

    gsap.to(contentRef.current, {
      opacity: 0,
      x: '-30px',
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => {
        window.location.href = '/';
      }
    });
  }

  return (
    <>
      {/* Nav bar: two pills, spaced apart */}
      <div
        id="slider-menu"
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'fixed',
          top: 10,
          left: 0,
          width: '100vw',
          zIndex: 1100,
          pointerEvents: 'auto',
          justifyContent: 'space-between',
          paddingRight: 48, // Removed paddingLeft to align with the left edge
        }}
      >
        {/* Images/About pill */}
        <div
          className="slider-tabs"
          style={{
            display: 'flex',
            gap: 0,
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1.5px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(4px)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontWeight: 500,
            fontSize: 14,
            overflow: 'hidden',
          }}
        >
          <a
            href="/images"
            className={`slider-tab ${activeTab === 0 ? 'active' : ''}`}
            onClick={handleNav(0, '/images')}
            style={{
              whiteSpace: 'nowrap',
              padding: '10px 24px',
              color: activeTab === 0 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Images
          </a>
          <a
            href="/about"
            className={`slider-tab ${activeTab === 1 ? 'active' : ''}`}
            onClick={handleNav(1, '/about')}
            style={{
              whiteSpace: 'nowrap',
              padding: '10px 24px',
              color: activeTab === 1 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              position: 'relative',
              zIndex: 1,
            }}
          >
            About
          </a>
          {/* Sliding pill indicator */}
          <div
            className="slider-indicator"
            ref={indicatorRef}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '100px', // Default width, will be updated dynamically
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '9999px',
              zIndex: 0,
              transition: 'transform 0.3s ease, width 0.3s ease',
            }}
          ></div>
        </div>
        {/* DOMAIN KING pill */}
        <a
          href="/"
          onClick={handleHome}
          className="domain-pill"
          style={{
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.1)',
            padding: '10px 32px',
            fontWeight: 500,
            fontSize: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.7)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            whiteSpace: 'nowrap',
            letterSpacing: 1,
            border: '1.5px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(4px)',
          }}
        >
          DOMAIN KING
        </a>
        {/* Blank spacer for right alignment */}
        <div style={{ width: '10%' }}></div>
      </div>
      <div ref={contentRef} style={{ minHeight: '100vh' }}>
        {children}
      </div>
    </>
  );
}
