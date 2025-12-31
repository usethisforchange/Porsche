const {useState, useEffect, useRef, useMemo, useCallback} = React;

const images = [
  {src: "image/Porche  (3).jpg", title: "Classic Elegance", desc: "Timeless design meets modern performance in every curve and contour"},
  {src: "image/Porche  (2).jpg", title: "Light Signature", desc: "Iconic LED taillight design that defines automotive excellence"},
  {src: "image/Porche  (3).jpg", title: "Engineering Art", desc: "Every detail crafted to perfection with uncompromising precision"},
  {src: "image/Porche  (4).jpg", title: "Precision Detail", desc: "Exquisite craftsmanship evident in every stitch and surface"},
  {src: "image/Porche  (5).jpg", title: "Luxury Interior", desc: "Premium materials and cutting-edge technology unite seamlessly"},
  {src: "image/Porche  (6).jpg", title: "Luxury Exterior", desc: "Masterful craftsmanship visible in every exterior element"},
  {src: "image/Porche  (7).jpg", title: "Classic Design", desc: "A harmonious blend of heritage and innovation in automotive design"},
  {src: "image/Porche  (8).jpg", title: "Build Quality", desc: "Built to last with meticulous attention to detail and superior materials"},
  {src: "image/Porche  (10).jpg", title: "Overall Beauty", desc: "Pure motorsport soul wrapped in timeless elegance"},
  {src: "image/Porche  (11).jpg", title: "Aerodynamic Design", desc: "Aerodynamic excellence in every curve for ultimate performance"}
];

const beatTimings = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];

const features = [
  {icon: "mdi-speedometer", title: "Performance", desc: "Unmatched speed and handling precision"},
  {icon: "mdi-shield-check", title: "Safety", desc: "Advanced safety systems for peace of mind"},
  {icon: "mdi-diamond-stone", title: "Luxury", desc: "Premium materials and craftsmanship"},
  {icon: "mdi-lightning-bolt", title: "Innovation", desc: "Cutting-edge technology and design"}
];

function App() {
  const [loading, setLoading] = useState(true);
  const [hidePreloader, setHidePreloader] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const heroImageRef = useRef();
  const navRef = useRef();
  const canvasRef = useRef();
  const autoScrollBtnRef = useRef();
  const preloaderAudioRef = useRef(null);
  const galleryAudioRef = useRef(null);
  const autoScrollTimeoutsRef = useRef([]);
  const isPreloaderAudioPlayingRef = useRef(false);
  const mainAudioRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 968);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      preloaderAudioRef.current = new Audio('sound/niko.mp3');
      preloaderAudioRef.current.loop = false;
      preloaderAudioRef.current.volume = 0;
      preloaderAudioRef.current.preload = 'auto';
      
      mainAudioRef.current = new Audio('sound/niko1.mp3');
      mainAudioRef.current.loop = false;
      mainAudioRef.current.volume = 0;
      mainAudioRef.current.preload = 'auto';
      
      galleryAudioRef.current = new Audio('sound/missme.mp3');
      galleryAudioRef.current.loop = false;
      galleryAudioRef.current.volume = 0;
      galleryAudioRef.current.preload = 'auto';
    } catch (err) {
      console.log('Audio initialization error:', err);
    }

    return () => {
      try {
        if (preloaderAudioRef.current) preloaderAudioRef.current.pause();
        if (mainAudioRef.current) mainAudioRef.current.pause();
        if (galleryAudioRef.current) galleryAudioRef.current.pause();
      } catch (err) {
        console.log('Audio cleanup error:', err);
      }
    };
  }, []);

  useEffect(() => {
    let progressInterval;
    const startTime = Date.now();
    const duration = 10000;

    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 70 && !isPreloaderAudioPlayingRef.current && preloaderAudioRef.current) {
        isPreloaderAudioPlayingRef.current = true;
        preloaderAudioRef.current.play().catch(err => console.log('Audio play error:', err));
        gsap.to(preloaderAudioRef.current, {volume: 0.5, duration: 1});
      }

      if (newProgress >= 100) {
        clearInterval(progressInterval);
        
        setTimeout(() => {
          if (mainAudioRef.current && preloaderAudioRef.current) {
            mainAudioRef.current.currentTime = preloaderAudioRef.current.currentTime;
            mainAudioRef.current.play().catch(err => console.log('Main audio error:', err));
            gsap.to(mainAudioRef.current, {volume: 0.3, duration: 2});
          }
          
          if (preloaderAudioRef.current) {
            gsap.to(preloaderAudioRef.current, {
              volume: 0,
              duration: 1,
              onComplete: () => {
                preloaderAudioRef.current.pause();
              }
            });
          }
        }, 500);

        setHidePreloader(true);
        setTimeout(() => setLoading(false), 1500);
      }
    }, 30);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (!loading && heroImageRef.current && !isMobile) {
      const handleScroll = () => {
        if (animationFrameRef.current) return;
        
        animationFrameRef.current = requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const maxScroll = window.innerHeight;
          const scale = 1 + (scrolled / maxScroll) * 0.3;
          
          if (scrolled < maxScroll && heroImageRef.current) {
            heroImageRef.current.style.transform = `scale(${Math.min(scale, 1.3)})`;
          }
          animationFrameRef.current = null;
        });
      };

      window.addEventListener('scroll', handleScroll, {passive: true});
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }
  }, [loading, isMobile]);

  const drawConnections = useCallback(() => {
    if (isMobile) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {alpha: true});
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rows = document.querySelectorAll('.gallery-row');
    const points = [];

    rows.forEach(row => {
      const img = row.querySelector('.gallery-image-container');
      if (img) {
        const imgRect = img.getBoundingClientRect();
        const containerRect = canvas.getBoundingClientRect();
        const centerX = imgRect.left - containerRect.left + imgRect.width / 2;
        const centerY = imgRect.top - containerRect.top + imgRect.height / 2;
        points.push({x: centerX, y: centerY});
      }
    });

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < points.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      const offset = i % 2 === 0 ? 30 : -30;
      
      ctx.quadraticCurveTo(midX + offset, midY, points[i + 1].x, points[i + 1].y);
      ctx.stroke();
    }

    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [isMobile]);

  const throttledDrawConnections = useMemo(() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(drawConnections, 100);
    };
  }, [drawConnections]);

  const handleAutoScroll = useCallback(() => {
    if (isAutoScrolling) {
      // Stop auto-scroll and restore
      setIsAutoScrolling(false);
      document.body.classList.remove('dark-mode');
      autoScrollTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      autoScrollTimeoutsRef.current = [];
      
      if (galleryAudioRef.current && !galleryAudioRef.current.paused) {
        gsap.to(galleryAudioRef.current, {
          volume: 0,
          duration: 0.5,
          onComplete: () => {
            galleryAudioRef.current.pause();
            galleryAudioRef.current.currentTime = 0;
          }
        });
      }
      
      if (mainAudioRef.current) {
        gsap.to(mainAudioRef.current, {volume: 0.3, duration: 1});
      }

      if (autoScrollBtnRef.current) {
        autoScrollBtnRef.current.classList.add('visible');
      }
    } else {
      // Start auto-scroll and enable dark mode immediately
      setIsAutoScrolling(true);
      document.body.classList.add('dark-mode');
      
      const gallerySection = document.getElementById('gallery');
      if (gallerySection) {
        gallerySection.scrollIntoView({behavior: 'smooth'});
      }

      if (mainAudioRef.current) {
        gsap.to(mainAudioRef.current, {volume: 0.05, duration: 1});
      }

      const startTimeout = setTimeout(() => {
        if (galleryAudioRef.current) {
          galleryAudioRef.current.currentTime = 0;
          galleryAudioRef.current.volume = 0;
          galleryAudioRef.current.play().catch(err => console.log('Gallery audio error:', err));
          gsap.to(galleryAudioRef.current, {volume: 0.5, duration: 1});
        }

        beatTimings.forEach((timing, index) => {
          if (index < images.length) {
            const timeout = setTimeout(() => {
              const galleryRow = document.querySelectorAll('.gallery-row')[index];
              const imgContainer = galleryRow?.querySelector('.gallery-image-container');
              
              if (galleryRow) {
                galleryRow.scrollIntoView({behavior: 'smooth', block: 'center'});
                
                if (imgContainer) {
                  imgContainer.classList.remove('reveal-left', 'reveal-right');
                  void imgContainer.offsetWidth;
                  imgContainer.classList.add(index % 2 === 0 ? 'reveal-left' : 'reveal-right');
                }
              }
            }, timing * 1000);
            autoScrollTimeoutsRef.current.push(timeout);
          }
        });

        const totalDuration = beatTimings[beatTimings.length - 1] + 3;
        const endTimeout = setTimeout(() => {
          setIsAutoScrolling(false);
          document.body.classList.remove('dark-mode');
          
          if (galleryAudioRef.current && !galleryAudioRef.current.paused) {
            gsap.to(galleryAudioRef.current, {
              volume: 0,
              duration: 1,
              onComplete: () => {
                galleryAudioRef.current.pause();
                galleryAudioRef.current.currentTime = 0;
              }
            });
          }
          
          if (mainAudioRef.current) {
            gsap.to(mainAudioRef.current, {volume: 0.3, duration: 1.5});
          }

          if (autoScrollBtnRef.current) {
            autoScrollBtnRef.current.classList.add('visible');
          }
        }, totalDuration * 1000);
        autoScrollTimeoutsRef.current.push(endTimeout);
      }, 1000);
      
      autoScrollTimeoutsRef.current.push(startTimeout);
    }
  }, [isAutoScrolling, images.length]);

  useEffect(() => {
    if (!loading) {
      gsap.registerPlugin(ScrollTrigger);
      
      ScrollTrigger.config({
        limitCallbacks: true,
        syncInterval: 150
      });

      // Hero animations
      gsap.to('.hero-title', {opacity: 1, y: 0, duration: 1.5, delay: 0.5, ease: 'power3.out'});
      gsap.to('.hero-subtitle', {opacity: 1, y: 0, duration: 1.2, delay: 0.8, ease: 'power3.out'});
      gsap.to('.scroll-indicator', {opacity: 1, duration: 1, delay: 1.2});
      gsap.to('.navbar', {opacity: 1, duration: 0.8, delay: 0.3});

      setTimeout(() => {
        if (autoScrollBtnRef.current) {
          autoScrollBtnRef.current.classList.add('visible');
        }
      }, 2000);

      // Gallery animations
      gsap.utils.toArray('.gallery-row').forEach((row, index) => {
        const imgContainer = row.querySelector('.gallery-image-container');
        
        ScrollTrigger.create({
          trigger: row,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(row, {
              opacity: 1,
              x: 0,
              duration: 1.2,
              ease: 'power3.out'
            });
            
            if (!isMobile) throttledDrawConnections();
            
            if (imgContainer && !isAutoScrolling) {
              imgContainer.classList.add(index % 2 === 0 ? 'reveal-left' : 'reveal-right');
            }
          }
        });
        
        gsap.set(row, {
          x: index % 2 === 0 ? -100 : 100
        });
      });

      gsap.utils.toArray('.feature-card').forEach((card, index) => {
        gsap.set(card, {opacity: 0, y: 100});
        ScrollTrigger.create({trigger: card, start: 'top 85%', once: true, onEnter: () => {
          gsap.to(card, {opacity:1, y:0, duration:1, delay: index * 0.15, ease:'power3.out'});
        }});
      });

      gsap.utils.toArray('.stat-number').forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target')) || parseInt(stat.textContent);
        gsap.set(stat, {textContent: 0});
        ScrollTrigger.create({trigger: stat, start: 'top 80%', once: true, onEnter: () => {
          gsap.to(stat, {textContent: target, duration:2.5, ease:'power2.inOut', snap:{textContent:1}, onUpdate:function(){stat.textContent = Math.ceil(this.targets()[0].textContent);}});
        }});
      });

      let scrollTimeout;
      const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (window.scrollY > 100) navRef.current?.classList.add('scrolled'); else navRef.current?.classList.remove('scrolled');
          if (!isMobile) throttledDrawConnections();
        }, 50);
      };

      window.addEventListener('scroll', handleScroll, {passive: true});
      
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => { if (!isMobile) throttledDrawConnections(); ScrollTrigger.refresh(); }, 250);
      };
      
      window.addEventListener('resize', handleResize, {passive: true});

      setTimeout(() => { if (!isMobile) throttledDrawConnections(); }, 500);

      return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('resize', handleResize); ScrollTrigger.getAll().forEach(t => t.kill()); };
    }
  }, [loading, isAutoScrolling, isMobile, throttledDrawConnections]);

  const toggleMobileMenu = useCallback(() => setMobileMenuOpen(prev => !prev), []);

  if (loading) {
    return (
      <div className={`preloader ${hidePreloader ? 'hiding' : ''}`}>
        <div className="preloader-logo">PORSCHE</div>
        <div className="preloader-text">911 GT1</div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{width: `${progress}%`}}></div>
        </div>
        <div className="loading-percentage">{Math.floor(progress)}%</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <button 
        ref={autoScrollBtnRef}
        className={`auto-scroll-btn ${isAutoScrolling ? 'active' : ''}`}
        onClick={handleAutoScroll}
        aria-label={isAutoScrolling ? 'Stop Auto Scroll' : 'Start Auto Scroll'}
      >
        {isAutoScrolling ? 'STOP TOUR' : 'START TOUR'}
      </button>

      <nav className="navbar" ref={navRef}>
        <a href="#" className="logo">PORSCHE</a>
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle Menu">
          <i className={`mdi ${mobileMenuOpen ? 'mdi-close' : 'mdi-menu'}`}></i>
        </button>
        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
          <li><a href="#gallery">GALLERY</a></li>
          <li><a href="#features">FEATURES</a></li>
          <li><a href="#stats">STATS</a></li>
          <li><a href="#contact">CONTACT</a></li>
        </ul>
      </nav>

      <section className="hero">
        <video
          ref={heroImageRef}
          src="image\Porsche.mp4"
          className="hero-image"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">PORSCHE 911 GT1</h1>
          <p className="hero-subtitle">Engineering Excellence</p>
        </div>
        <div className="scroll-indicator">
          <i className="mdi mdi-chevron-down"></i>
        </div>
      </section>

      <section id="gallery" className="gallery-section">
        <h2 className="section-title">GALLERY</h2>
        {!isMobile && <canvas ref={canvasRef} id="connection-canvas"></canvas>}
        <div className="gallery-container">
          {images.map((img, index) => (
            <div key={index} className={`gallery-row ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="gallery-image-container">
                <img 
                  src={img.src} 
                  alt={img.title}
                  loading="lazy"
                  onError={(e) => {
                    console.error(`Failed to load: ${img.src}`);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="gallery-info">
                <div className="gallery-number">{String(index + 1).padStart(2, '0')}</div>
                <h3 className="gallery-title">{img.title}</h3>
                <p className="gallery-desc">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="features-section">
        <h2 className="section-title">FEATURES</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <i className={`mdi ${feature.icon} feature-icon`}></i>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="stats" className="stats-section">
        <h2 className="section-title">PERFORMANCE STATS</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number" data-target="310">310</div>
            <div className="stat-label">Top Speed km/h</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="3">3</div>
            <div className="stat-label">0-100 km/h sec</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="544">544</div>
            <div className="stat-label">Horsepower</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="28">28</div>
            <div className="stat-label">Years Legacy</div>
          </div>
        </div>
      </section>

      <section id="cta" className="cta-section">
        <h2 className="cta-title">EXPERIENCE THE LEGEND</h2>
        <p className="cta-text">Discover the perfect blend of performance, luxury and innovation</p>
        <a href="#" className="cta-button">Schedule Test Drive</a>
      </section>

      <footer>
        <div className="footer-content">
          <p className="footer-text">© 2025 Arronstone Engineering. All rights reserved. Image Credit:- KonradKorus</p>
          <div className="social-links">
            <a href="https://www.facebook.com/konrad.korus.12" title="Facebook" aria-label="Facebook"><i className="mdi mdi-facebook"></i></a>
            <a href="https://www.instagram.com/the.stone.project?igsh=MTh5eXI3czk0aHNvYg==" title="Instagram" aria-label="Instagram"><i className="mdi mdi-instagram"></i></a>
            <a href="https://www.twitter.com" title="Twitter" aria-label="Twitter"><i className="mdi mdi-twitter"></i></a>
            <a href="https://www.youtube.com" title="YouTube" aria-label="YouTube"><i className="mdi mdi-youtube"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
