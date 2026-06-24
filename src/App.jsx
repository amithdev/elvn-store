import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);
import { Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchAllProducts, fetchProductById, fetchProductsByTag, shopifyClient } from './shopify';
import "./App.css";

const getImageScale = (title) => {
  if (!title) return 'none';
  const t = title.toLowerCase();
  // Most Away jerseys are perfectly sized, but Spain Away needs a slight bump
  if (t.includes('away')) {
    if (t.includes('uruguay') || t.includes('mexico') || t.includes('norway')) return 'scale(1.25)';
    if (t.includes('spain')) return 'scale(1.15)';
    return 'none';
  }
  // Portugal, Brazil, Germany, and Argentina Home jerseys are already a good size
  if (t.includes('portugal') || t.includes('brazil') || t.includes('germany') || t.includes('argentina')) return 'none';
  // All other Home jerseys need to be zoomed in to match
  if (t.includes('home') || t.includes('france') || t.includes('england') || t.includes('italy') || t.includes('spain') || t.includes('belgium') || t.includes('mexico') || t.includes('colombia') || t.includes('japan')) {
    return 'scale(1.35)';
  }
  return 'none';
};
function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customPrintPrice, setCustomPrintPrice] = useState(200);
  const [sleeveBadgePrice, setSleeveBadgePrice] = useState(100);

  useEffect(() => {
    shopifyClient.product.fetchQuery({ query: 'title:"Custom Print Add-on"' }).then(res => {
      if (res.length > 0 && res[0].variants.length > 0) setCustomPrintPrice(parseFloat(res[0].variants[0].price.amount));
    });
    shopifyClient.product.fetchQuery({ query: 'title:"Sleeve Badge Add-on"' }).then(res => {
      if (res.length > 0 && res[0].variants.length > 0) setSleeveBadgePrice(parseFloat(res[0].variants[0].price.amount));
    });
  }, []);

  const addToCart = (item) => {
    setCartItems(prev => [...prev, item]);
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, isCartOpen, setIsCartOpen, customPrintPrice, sleeveBadgePrice }}>
      <div className="app">
        <TopStrip />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/world-cup" element={<WorldCupPage />} />
          <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/collection/:tag" element={<CollectionPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
        <StickyCart />
      </div>
    </CartContext.Provider>
  );
}

function HomePage() {
  return (
    <main className="home-page">
      <Hero />
      <ShopTheDrop />
      <MoreCategories />
      <FindYourJersey />
      <TrendingNow />
      <Features />
      <FooterCTA />
      <Footer />
    </main>
  );
}

function TopStrip() {
  const content = (
    <>
      <span>WORLD CUP DROP LIVE</span>
      <span className="marquee-dot">•</span>
      <span>PREMIUM JERSEYS</span>
      <span className="marquee-dot">•</span>
      <span>FAST SHIPPING</span>
      <span className="marquee-dot">•</span>
    </>
  );

  return (
    <div className="top-strip">
      <div className="marquee-content">
        {content}
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  
  const location = useLocation();
  const currentPath = decodeURIComponent(location.pathname);
  
  const { setIsCartOpen, cartItems } = useCart();

  useEffect(() => {
    if (isSearchOpen && allProducts.length === 0) {
      setIsSearching(true);
      fetchAllProducts().then(res => {
        setAllProducts(res);
        setIsSearching(false);
      });
    }
  }, [isSearchOpen, allProducts.length]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const q = searchQuery.toLowerCase();
      const results = allProducts.filter(p => {
        if (p.title.toLowerCase().includes('add-on')) return false;
        
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchTag = p.tags && p.tags.some(t => 
          (typeof t === 'string' ? t.toLowerCase().includes(q) : (t.value && t.value.toLowerCase().includes(q)))
        );
        return matchTitle || matchTag;
      });
      setSearchResults(results);
    }
  }, [searchQuery, allProducts]);
  
  const renderLink = (to, text) => {
    const isActive = currentPath === to;
    return (
      <Link 
        to={to} 
        onClick={() => setIsMenuOpen(false)} 
        className={isActive ? "bold-link" : ""}
      >
        {text}
        {isActive && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        )}
      </Link>
    );
  };
  return (
    <>
      <nav className="navbar">
        <button className="icon-btn" onClick={() => setIsMenuOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}><h1 className="logo" style={{ margin: 0 }}>ELVN</h1></Link>
        <div className="nav-icons">
          <button className="icon-btn" onClick={() => setIsSearchOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
          </button>
        </div>
      </nav>

      <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`}>
        <div className="search-header" style={{ borderBottom: 'none', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#fff' }}>Search</h2>
            <button className="close-search-btn" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} style={{ padding: '8px', background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search teams, tags, drops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input premium-search-input"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="search-results-container">
          {isSearching ? (
            <div className="search-status">Loading premium catalog...</div>
          ) : searchQuery.trim() !== '' && searchResults.length === 0 ? (
            <div className="search-status">No results found for "{searchQuery}"</div>
          ) : searchQuery.trim() === '' ? (
            <div className="search-status" style={{color: '#52525b'}}>Start typing to find your fit...</div>
          ) : (
            <div className="product-grid-2col">
              {searchResults.map(product => {
                const price = product.variants[0]?.price?.amount || "0.00";
                const imageSrc = product.images[0]?.src || '/images/world_cup.png';
                return (
                  <Link 
                    to={`/product/${product.id.split('/').pop()}`} 
                    key={product.id} 
                    className="collection-card"
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  >
                    <div className="collection-card-img-wrapper">
                    <img 
                      src={imageSrc} 
                      alt={product.title} 
                      style={{ transform: getImageScale(product.title) }}
                    />
                  </div>
                    <div className="collection-card-info">
                      <h4 className="collection-card-title">{product.title}</h4>
                      <div className="collection-card-bottom">
                        <span className="collection-card-price">₹{parseFloat(price).toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="menu-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            <span>Menu</span>
          </div>
          <button className="close-menu-btn" onClick={() => setIsMenuOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="mobile-menu-links">
          {renderLink("/", "Home")}
          {renderLink("/collection/World Cup", "World Cup 2026")}
          {renderLink("/collection/Player Version", "Player Version")}
          {renderLink("/collection/Fan Version", "Fan Version")}
          {renderLink("/collection/26-27", "Season 2026 - 2027")}
          {renderLink("/collection/Shorts Set", "Jersey Shorts Set")}
          {renderLink("/collection/National", "National Jerseys")}
          {renderLink("/collection/Club", "Club Jerseys")}
          {renderLink("/track-order", "Track Order")}
        </div>
        
        <div className="mobile-menu-footer">
          <span>For more details</span>
          <div className="menu-socials">
            <a href="https://instagram.com/elvnstore.in" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://wa.me/918075642079" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-text-container">
        <div className="tags-row">
          <div className="live-tag">
            <span className="lime-dot"></span>
            DROP 04 // LIVE
          </div>
          <div className="sub-tag">BUILT FOR REAL FANS.</div>
        </div>

        <h2 className="hero-title">
          WORLD CUP<br />JERSEYS
        </h2>

        <p className="hero-subtitle">
          Premium fan and player version kits for match days, streetwear fits, and deep collectors.
        </p>
      </div>

      <div className="hero-image-card">
        <img
          src="/images/portugal-hero.jpg"
          alt="Portugal Jersey"
          className="hero-img"
        />

        <div className="product-badge">
          <p className="badge-title">Portugal 26-27 -<br/>Player version jersey</p>
          <strong className="badge-price">$1199.00</strong>
        </div>

        <div className="cta-container">
          <Link to="/collection/Trending" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>SHOP NEW ARRIVALS</Link>
        </div>
      </div>
    </section>
  );
}

function ShopTheDrop() {
  return (
    <section className="shop-section">
      <div className="section-header">
        <h3 className="section-title">SHOP THE DROP</h3>
        <span className="section-subtitle">CURATED</span>
      </div>

      <div className="bento-grid">
        {/* Full Width Top Card */}
        <Link to="/world-cup" className="bento-card bento-full">
          <img src="/images/world-cup.jpg" alt="World Cup" className="bento-img" />
          <div className="bento-content">
            <h4 className="bento-title">WORLD CUP<br/>2026</h4>
            <span className="bento-link">SHOP NOW ↗</span>
          </div>
        </Link>

        {/* Left Column - Card 1 */}
        <Link to="/collection/Argentina" className="bento-card bento-left">
          <img src="/images/argentina.jpg" alt="Argentina" className="bento-img" />
          <div className="bento-content">
            <h4 className="bento-title">ARGENTINA</h4>
            <span className="bento-link">EXPLORE &gt;</span>
          </div>
        </Link>

        {/* Right Column - Tall Card */}
        <Link to="/collection/Goat Drops" className="bento-card bento-tall">
          <img src="/images/goat-drops.jpg" alt="Goat Drops" className="bento-img" />
          <div className="bento-content">
            <span className="goat-tag">LM10 X CR7</span>
            <h4 className="bento-title">GOAT DROPS</h4>
            <button className="goat-btn">SHOP</button>
          </div>
        </Link>

        {/* Left Column - Card 2 */}
        <Link to="/collection/Club" className="bento-card bento-left">
          <img src="/images/club-kits.jpg" alt="Club Kits" className="bento-img bento-img-contain" />
          <div className="bento-content">
            <h4 className="bento-title">CLUB KITS</h4>
            <span className="bento-link">VIEW CLUBS &gt;</span>
          </div>
        </Link>
      </div>

      <div className="middle-ticker">
        <div className="middle-ticker-track">
          <span style={{ paddingRight: '24px' }}>PREMIUM QUALITY JERSEYS • LIMITED RESTOCKS • PREMIUM QUALITY JERSEYS • LIMITED RESTOCKS •</span>
          <span style={{ paddingRight: '24px' }}>PREMIUM QUALITY JERSEYS • LIMITED RESTOCKS • PREMIUM QUALITY JERSEYS • LIMITED RESTOCKS •</span>
        </div>
      </div>
    </section>
  );
}

function MoreCategories() {
  return (
    <section className="shop-section" style={{ paddingTop: '24px' }}>
      <div className="bento-grid-reverse">
        {/* Left Column - Tall Card */}
        <Link to="/collection/Player Version" className="bento-card bento-tall-left">
          <img src="/images/player-version.jpg" alt="Player Version" className="bento-img" />
          <div className="bento-content">
            <h4 className="bento-title">PLAYER<br/>VERSION</h4>
            <span className="goat-tag" style={{ marginTop: '4px' }}>ENGINEERED FABRIC</span>
            <span className="bento-link" style={{ color: '#ccff00', marginTop: '8px' }}>PERFORMANCE FIT &rarr;</span>
          </div>
        </Link>

        {/* Right Column - Top Square */}
        <Link to="/collection/Fan Version" className="bento-card bento-right">
          <img src="/images/fan-version.jpg" alt="Fan Version" className="bento-img" />
          <div className="bento-content">
            <h4 className="bento-title">FAN VERSION</h4>
            <span className="bento-link">EVERYDAY &gt;</span>
          </div>
        </Link>

        {/* Right Column - Bottom Square */}
        <Link to="/collection/Retro" className="bento-card bento-right">
          <img src="/images/retro.jpg" alt="Retro" className="bento-img" />
          <div className="bento-content">
            <h4 className="bento-title">RETRO</h4>
            <span className="bento-link">GO RETRO &gt;</span>
          </div>
        </Link>
      </div>

      {/* Full Sets Horizontal Card */}
      <Link to="/collection/Shorts Set" className="horizontal-card">
        <img src="/images/full-sets.jpg" alt="Full Sets" className="bento-img horizontal-img" />
        <div className="horizontal-content">
          <span className="goat-tag">KITS + SHORTS</span>
          <h4 className="bento-title" style={{ fontSize: '22px', margin: '4px 0' }}>FULL SETS</h4>
          <span className="bento-link">COMPLETE THE FIT &gt;</span>
        </div>
      </Link>

      {/* Lime Best Sellers Card */}
      <Link to="/collection/Best Sellers" className="lime-card">
        <div className="lime-card-content">
          <h4 className="lime-card-title">BEST<br/>SELLERS</h4>
          <div className="lime-card-sub">TOP RATED</div>
        </div>
        <img src="/images/best-sellers.jpg" alt="Best Sellers" className="lime-card-img" />
      </Link>
    </section>
  );
}

function FindYourJersey() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleSearch = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (!queries.includes(inputValue.trim())) {
        setQueries([...queries, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const addQuery = (q) => {
    if (!queries.includes(q)) {
      setQueries([...queries, q]);
    }
  };

  const removeQuery = (qToRemove) => {
    setQueries(queries.filter(q => q !== qToRemove));
  };

  const handleCategoryClick = (category) => {
    const finalQueries = [...queries];
    if (inputValue.trim() !== '' && !finalQueries.includes(inputValue.trim())) {
      finalQueries.push(inputValue.trim());
    }
    if (!finalQueries.includes(category)) {
      finalQueries.push(category);
    }
    navigate(`/collection/${finalQueries.join(',')}`);
  };

  return (
    <section className="find-jersey-section">
      <h3 className="find-jersey-title">Find Your Jersey Fast</h3>
      
      <div className="search-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        
        {queries.map((q) => (
          <span key={q} className="search-breadcrumb" onClick={() => removeQuery(q)} style={{
            background: '#ccff00', color: '#000', fontWeight: '600', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
          }}>
            {q}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </span>
        ))}
        
        <input 
          type="text" 
          placeholder={queries.length > 0 ? "Add another filter..." : "Search club, country, player..."}
          className="search-input" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleSearch}
          style={{ flex: 1, minWidth: '120px' }}
        />
      </div>

      <div className="popular-tags">
        <span className="popular-label">POPULAR:</span>
        <div className="tags-scroll">
          <span className="tag" onClick={() => addQuery("Argentina")} style={{cursor: 'pointer'}}>Argentina</span>
          <span className="tag" onClick={() => addQuery("Real Madrid")} style={{cursor: 'pointer'}}>Real Madrid</span>
          <span className="tag" onClick={() => addQuery("Messi")} style={{cursor: 'pointer'}}>Messi</span>
          <span className="tag" onClick={() => addQuery("Retro")} style={{cursor: 'pointer'}}>Retro 90s</span>
        </div>
      </div>

      <div className="category-links">
        <div onClick={() => handleCategoryClick("Player Version")} className="cat-link" style={{cursor: 'pointer'}}>
          <div className="cat-link-left">
            <span>PLAYER VERSION</span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
        <div onClick={() => handleCategoryClick("Fan Version")} className="cat-link" style={{cursor: 'pointer'}}>
          <div className="cat-link-left">
            <span>FAN VERSION</span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
        <div onClick={() => handleCategoryClick("National")} className="cat-link" style={{cursor: 'pointer'}}>
          <div className="cat-link-left">
            <span>NATIONAL TEAMS</span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
        <div onClick={() => handleCategoryClick("Club")} className="cat-link" style={{cursor: 'pointer'}}>
          <div className="cat-link-left">
            <span>CLUB JERSEYS</span>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
      </div>
    </section>
  );
}

function TrendingNow() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProductsByTag('Trending').then(res => {
      // Filter out add-ons and get the first 6 products as trending
      const filtered = res.filter(p => !p.title.toLowerCase().includes('add-on'));
      setProducts(filtered.slice(0, 6));
    });
  }, []);

  return (
    <section className="shop-section">
      <div className="section-header">
        <h3 className="section-title">TRENDING NOW</h3>
        <Link to="/collection/Trending" className="section-subtitle" style={{ textDecoration: 'none' }}>VIEW ALL</Link>
      </div>

      <div className="trending-scroll" style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {products.map((product) => {
          const encodedId = product.id.split('/').pop();
          const price = product.variants[0]?.price?.amount || "0.00";
          // Try to get the 4th image (index 3) which is usually the close-up badge shot
          // Or fallback to the last image, or the first image
          const imageSrc = product.images[3]?.src || product.images[product.images.length - 1]?.src || product.images[0]?.src || '/images/world_cup.png';
          
          // E.g. "Germany 2026 Home Jersey - PLAYER VERSION"
          const displayTitle = product.title.toUpperCase();
          const splitTitle = displayTitle.split('-');
          const mainTitle = splitTitle[0]?.replace('JERSEY', '').trim() || displayTitle;
          const subTitle = splitTitle[1]?.trim() || "PLAYER VERSION";

          return (
            <Link to={`/product/${encodedId}`} key={product.id} className="trending-card" style={{ minWidth: '160px', textDecoration: 'none', color: 'inherit' }}>
              <div className="trending-img-wrapper" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1a1a1a', aspectRatio: '3/4' }}>
                {product.images.length > 0 && <div className="trending-pill" style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', zIndex: 2 }}>1/{product.images.length}</div>}
                <img src={imageSrc} alt={product.title} className="trending-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="trending-info" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 className="trending-name" style={{ fontSize: '14px', margin: 0, fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mainTitle}</h4>
                <span className="trending-type" style={{ fontSize: '11px', color: '#a1a1aa' }}>{subTitle}</span>
                <span className="trending-price" style={{ fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>₹{parseFloat(price).toFixed(2)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="features-section">
      <div className="features-grid">
        <div className="feature-item">
          <svg className="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4L22 10l-6 4.8 2.4 7.2L12 17.2 5.6 22l2.4-7.2L2 10l7.6-.6L12 2z"></path>
          </svg>
          <h4 className="feature-title">Premium Fabric</h4>
          <p className="feature-desc">Exact weight, breathability, and details of official kits.</p>
        </div>
        <div className="feature-item">
          <svg className="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
          <h4 className="feature-title">Quality Checked</h4>
          <p className="feature-desc">Every badge and stitch inspected before shipping.</p>
        </div>
        <div className="feature-item">
          <svg className="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h4 className="feature-title">Fast Shipping</h4>
          <p className="feature-desc">Global delivery with tracking straight to your door.</p>
        </div>
        <div className="feature-item">
          <svg className="feature-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h4 className="feature-title">24/7 Support</h4>
          <p className="feature-desc">Real humans ready to help with sizing or orders.</p>
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="footer-cta-section">
      <div className="cta-glow"></div>
      <h2 className="cta-heading">YOUR MATCH-DAY<br/>FIT STARTS HERE</h2>
      <p className="cta-subheading">Stock is limited. Don't miss the current drop.</p>
      <Link to="/collection/All" className="cta-btn-lime" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', margin: '0 auto' }}>SHOP THE DROP &rarr;</Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-logo">ELVN</div>
      <p className="footer-desc">Premium football aesthetic. Elevating the culture<br/>on and off the pitch.</p>
      
      <div className="email-signup">
        <input type="email" placeholder="Join the club for early drops..." className="email-input" />
      </div>

      <div className="footer-links-grid">
        <div className="footer-column">
          <h5 className="footer-col-title">SHOP</h5>
          <ul className="footer-col-list">
            <li><Link to="/collection/Trending">New Arrivals</Link></li>
            <li><Link to="/collection/National">National Teams</Link></li>
            <li><Link to="/collection/Club">Clubs</Link></li>
            <li><Link to="/collection/Retro">Retro</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h5 className="footer-col-title">SUPPORT</h5>
          <ul className="footer-col-list">
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping-returns">Shipping & Returns</Link></li>
            <li><Link to="/size-guide">Size Guide</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copyright">© 2026 ELVN.</span>
        <div className="footer-socials">
          <a href="https://instagram.com/elvnstore.in" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://wa.me/918075642079" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="WhatsApp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

function FilterMenu({ isOpen, onClose, activeFilters, setActiveFilters, uniqueTypes, uniqueTeams, uniqueTournaments }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [localFilters, setLocalFilters] = useState(activeFilters || { sort: 'default', type: [], category: [], team: [], tournament: [], price: [] });

  useEffect(() => {
    if (isOpen && activeFilters) {
      setLocalFilters(activeFilters);
      setExpandedSection(null);
    }
  }, [isOpen, activeFilters]);

  const handleApply = () => {
    if (typeof setActiveFilters === 'function') {
      setActiveFilters(localFilters);
    }
    onClose();
  };

  const handleClear = () => {
    const cleared = { sort: 'default', type: [], category: [], team: [], tournament: [], price: [] };
    setLocalFilters(cleared);
    setActiveFilters(cleared);
    onClose();
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleArrayFilter = (key, value) => {
    setLocalFilters(prev => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const setSort = (val) => {
    setLocalFilters(prev => ({ ...prev, sort: val }));
  };

  const renderCheckboxRow = (label, isSelected, onClick) => (
    <div key={label} style={{ padding: '16px 0', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', color: isSelected ? '#000' : '#71717a', fontWeight: isSelected ? 'bold' : 'normal' }} onClick={onClick}>
      {label} {isSelected && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
    </div>
  );

  return (
    <div className={`filter-overlay ${isOpen ? 'open' : ''}`}>
      <div className="filter-header">
        <h3 className="filter-title">Filter & Sort by</h3>
        <button className="close-filter-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="filter-options">
        <div className={`filter-item ${expandedSection === 'sort' ? 'active' : ''}`} onClick={() => toggleSection('sort')}>
          Sort by
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedSection === 'sort' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        {expandedSection === 'sort' && (
          <div style={{ background: '#fcfcfc', padding: '0 20px', borderTop: '1px solid #e5e5e5' }}>
            {renderCheckboxRow('Featured', localFilters.sort === 'default', () => setSort('default'))}
            {renderCheckboxRow('Price: Low to High', localFilters.sort === 'price-asc', () => setSort('price-asc'))}
            {renderCheckboxRow('Price: High to Low', localFilters.sort === 'price-desc', () => setSort('price-desc'))}
            {renderCheckboxRow('Newest Arrivals', localFilters.sort === 'newest', () => setSort('newest'))}
          </div>
        )}
        

      </div>
      
      <div className="filter-footer">
        <button className="clear-btn" onClick={handleClear}>Clear All</button>
        <button className="apply-btn" onClick={handleApply}>Apply Filters</button>
      </div>
    </div>
  );
}

function CollectionPage() {
  const { tag } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    sort: 'default',
    type: [],
    category: [],
    team: [],
    tournament: [],
    price: []
  });

  const tagToDisplay = {
    "World Cup": "World Cup 2026",
    "Player Version": "Player Version",
    "Fan Version": "Fan Version",
    "26-27": "Season 2026 - 2027",
    "Shorts Set": "Jersey Shorts Set",
    "National": "National Jerseys",
    "Club": "Club Jerseys",
    "Argentina": "Argentina National Team",
    "Goat Drops": "Goat Drops (LM10 x CR7)",
    "Retro": "Retro Classics",
    "Best Sellers": "Best Sellers",
    "All": "All Products"
  };

  const displayTitle = tag.split(',').map(t => tagToDisplay[t.trim()] || t.trim()).join(' + ');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    if (tag === 'All') {
      fetchAllProducts().then(fetchedProducts => {
        setProducts(fetchedProducts.filter(p => !p.title.toLowerCase().includes('add-on')));
        setLoading(false);
      });
    } else {
      fetchProductsByTag(tag).then(fetchedProducts => {
        setProducts(fetchedProducts.filter(p => !p.title.toLowerCase().includes('add-on')));
        setLoading(false);
      });
    }
  }, [tag]);

  const uniqueTypes = Array.from(new Set(products.map(p => p.productType || 'Jersey'))).filter(Boolean);
  const uniqueTeams = Array.from(new Set(products.map(p => p.title.split(' ')[0]))).filter(t => t.length > 2);
  const uniqueTournaments = Array.from(new Set(products.map(p => {
    if (p.title.includes('2026') || p.title.includes('26')) return 'World Cup 2026';
    if (p.title.includes('2024') || p.title.includes('24')) return 'Euro 2024';
    return 'Other';
  })));

  let filteredProducts = [...products];
  if (activeFilters.type.length > 0) {
    filteredProducts = filteredProducts.filter(p => activeFilters.type.includes(p.productType || 'Jersey'));
  }
  if (activeFilters.category.length > 0) {
    filteredProducts = filteredProducts.filter(p => activeFilters.category.some(c => p.title.toLowerCase().includes(c.toLowerCase())));
  }
  if (activeFilters.team.length > 0) {
    filteredProducts = filteredProducts.filter(p => activeFilters.team.some(team => p.title.includes(team)));
  }
  if (activeFilters.tournament.length > 0) {
    filteredProducts = filteredProducts.filter(p => activeFilters.tournament.some(tourn => p.title.includes(tourn.split(' ')[1]) || (tourn === 'Other' && !p.title.includes('20') && !p.title.includes('24'))));
  }
  if (activeFilters.price.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const price = parseFloat(p.variants[0]?.price?.amount || 0);
      return activeFilters.price.some(range => {
        if (range === 'Under ₹1000') return price < 1000;
        if (range === '₹1000 - ₹1500') return price >= 1000 && price <= 1500;
        if (range === 'Over ₹1500') return price > 1500;
        return false;
      });
    });
  }

  const sortedProducts = filteredProducts.sort((a, b) => {
    const sortOption = activeFilters.sort;
    
    // Helper to safely get price
    const getPrice = (prod) => {
      const variant = prod.variants && prod.variants[0];
      if (!variant) return 0;
      if (variant.price && typeof variant.price.amount !== 'undefined') return parseFloat(variant.price.amount);
      if (typeof variant.price === 'string' || typeof variant.price === 'number') return parseFloat(variant.price);
      return 0;
    };

    // Helper to safely get date
    const getDate = (prod) => {
      return new Date(prod.createdAt || prod.publishedAt || 0).getTime();
    };

    if (sortOption === 'price-asc') {
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      if (priceA === priceB) return a.title.localeCompare(b.title);
      return priceA - priceB;
    } else if (sortOption === 'price-desc') {
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      if (priceA === priceB) return b.title.localeCompare(a.title);
      return priceB - priceA;
    } else if (sortOption === 'newest') {
      const dateA = getDate(a);
      const dateB = getDate(b);
      if (dateA === dateB) return a.title.localeCompare(b.title);
      return dateB - dateA;
    }
    return 0; // default
  });

  const sortLabels = {
    'default': 'Filter & Sort',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'newest': 'Newest Arrivals'
  };
  const filterBtnText = sortLabels[activeFilters.sort] || 'Filter & Sort';

  return (
    <main className="collection-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / {displayTitle}
      </div>
      
      <div className="filter-row">
        <span className="product-count">{loading ? '...' : sortedProducts.length} Products</span>
        <button className="filter-btn" onClick={() => setIsFilterOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          {filterBtnText}
        </button>
      </div>
      <FilterMenu 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        uniqueTypes={uniqueTypes}
        uniqueTeams={uniqueTeams}
        uniqueTournaments={uniqueTournaments}
      />

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#71717a', fontSize: '14px' }}>
          Loading premium jerseys...
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#71717a', fontSize: '14px' }}>
          No jerseys found for "{displayTitle}". <br/><br/>
          <Link to="/" style={{ color: '#09090b', fontWeight: 'bold' }}>Browse all collections</Link>
        </div>
      ) : (
        <div className="product-grid-2col">
          {sortedProducts.map(product => {
            // Shopify data extraction
            const price = product.variants[0]?.price?.amount || "0.00";
            const imageSrc = product.images[0]?.src || '/images/world_cup.png';
            
            return (
              <Link to={`/product/${product.id.split('/').pop()}`} key={product.id} className="collection-card">
                <div className="collection-card-img-wrapper">
                  <img 
                    src={imageSrc} 
                    alt={product.title} 
                    style={{ transform: getImageScale(product.title) }}
                  />
                </div>
                <div className="collection-card-info">
                  <h4 className="collection-card-title">{product.title}</h4>
                  <div className="collection-card-bottom">
                    <span className="collection-card-price">₹{parseFloat(price).toFixed(2)}</span>
                    <span className="collection-card-rating">
                      {/* Placeholder rating since Shopify doesn't have native reviews by default */}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      <span className="rating-num">5.0</span>
                      <span className="rating-count">(0)</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      <Footer />
    </main>
  );
}

function WorldCupPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    sort: 'default',
    type: [],
    category: [],
    team: [],
    tournament: [],
    price: []
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductsByTag('World Cup').then(fetchedProducts => {
      setProducts(fetchedProducts);
      setLoading(false);
    });
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    const sortOption = activeFilters.sort;
    
    const getPrice = (prod) => {
      const variant = prod.variants && prod.variants[0];
      if (!variant) return 0;
      if (variant.price && typeof variant.price.amount !== 'undefined') return parseFloat(variant.price.amount);
      if (typeof variant.price === 'string' || typeof variant.price === 'number') return parseFloat(variant.price);
      return 0;
    };

    const getDate = (prod) => {
      return new Date(prod.createdAt || prod.publishedAt || 0).getTime();
    };

    if (sortOption === 'price-asc') {
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      if (priceA === priceB) return a.title.localeCompare(b.title);
      return priceA - priceB;
    } else if (sortOption === 'price-desc') {
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      if (priceA === priceB) return b.title.localeCompare(a.title);
      return priceB - priceA;
    } else if (sortOption === 'newest') {
      const dateA = getDate(a);
      const dateB = getDate(b);
      if (dateA === dateB) return a.title.localeCompare(b.title);
      return dateB - dateA;
    }
    return 0;
  });

  const sortLabels = {
    'default': 'Filter & Sort',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'newest': 'Newest Arrivals'
  };
  const filterBtnText = sortLabels[activeFilters.sort] || 'Filter & Sort';

  return (
    <main className="collection-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / World Cup 2026
      </div>
      
      <div className="filter-row">
        <span className="product-count">{loading ? '...' : sortedProducts.length} Products</span>
        <button className="filter-btn" onClick={() => setIsFilterOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          {filterBtnText}
        </button>
      </div>
      <FilterMenu 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#71717a', fontSize: '14px' }}>
          Loading your premium jerseys...
        </div>
      ) : (
        <div className="product-grid-2col">
          {sortedProducts.map(product => {
            // Shopify data extraction
            const price = product.variants[0]?.price?.amount || "0.00";
            const imageSrc = product.images[0]?.src || '/images/world_cup.png';
            
            return (
              <Link to={`/product/${product.id.split('/').pop()}`} key={product.id} className="collection-card">
                <div className="collection-card-img-wrapper">
                  <img 
                    src={imageSrc} 
                    alt={product.title} 
                    style={{ transform: getImageScale(product.title) }}
                  />
                </div>
                <div className="collection-card-info">
                  <h4 className="collection-card-title">{product.title}</h4>
                  <div className="collection-card-bottom">
                    <span className="collection-card-price">₹{parseFloat(price).toFixed(2)}</span>
                    <span className="collection-card-rating">
                      {/* Placeholder rating since Shopify doesn't have native reviews by default */}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      <span className="rating-num">5.0</span>
                      <span className="rating-count">(0)</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      <Footer />
    </main>
  );
}

function ProductPage() {
  const { id } = useParams();
  const { addToCart, customPrintPrice, sleeveBadgePrice } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedVersion, setSelectedVersion] = useState('Player');
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  // Customization state
  const [nameInput, setNameInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [showNameInputs, setShowNameInputs] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState('none');
  const [openAccordion, setOpenAccordion] = useState(null);
  
  // Carousel state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductById(`gid://shopify/Product/${id}`).then(res => {
      setProduct(res);
      setLoading(false);
    });
  }, [id]);

  // Auto-slide effect
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveImageIndex(prev => {
        const nextIndex = (prev + 1) % product.images.length;
        if (carouselRef.current) {
          const slideWidth = carouselRef.current.offsetWidth;
          carouselRef.current.scrollTo({
            left: nextIndex * slideWidth,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [product]);

  const handleScroll = (e) => {
    if (!e.target) return;
    const slideWidth = e.target.offsetWidth;
    const scrollPosition = e.target.scrollLeft;
    const newIndex = Math.round(scrollPosition / slideWidth);
    if (newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex);
    }
  };

  const scrollToImage = (index) => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
      setActiveImageIndex(index);
    }
  };

  if (loading) {
    return (
      <main className="product-page" style={{ padding: '40px', textAlign: 'center' }}>
        Loading jersey details...
      </main>
    );
  }

  if (!product) {
    return <main className="product-page" style={{ padding: '40px', textAlign: 'center' }}>Product not found</main>;
  }

  const price = product.variants[0]?.price?.amount || "0.00";
  const imageSrc = product.images[0]?.src || '/images/world_cup.png';
  const displayTitle = product.title.toUpperCase();

  // Parse Title to match design
  const splitTitle = displayTitle.split('-');
  const mainTitle = splitTitle[0]?.replace('JERSEY', '').trim() || displayTitle;
  const subTitle = selectedVersion === 'Fan' ? "FAN VERSION" : "PLAYER VERSION";
  
  // Dynamic Price logic based on Version
  let activePrice = selectedVersion === 'Player' ? 1099 : 850;
  let activeCompareAt = selectedVersion === 'Player' ? 1758.40 : 1499;

  // Try to find a real variant in Shopify that matches the selected version
  if (product.variants && product.variants.length > 0) {
    const matchedVariant = product.variants.find(v => v.title.toLowerCase().includes(selectedVersion.toLowerCase()));
    if (matchedVariant && matchedVariant.price) {
      activePrice = parseFloat(matchedVariant.price.amount);
      if (matchedVariant.compareAtPrice) {
        activeCompareAt = parseFloat(matchedVariant.compareAtPrice.amount);
      } else {
        activeCompareAt = (activePrice * 1.6).toFixed(2);
      }
    } else if (selectedVersion === 'Player') {
      // Fallback to the first variant if no specific "Player" variant exists yet
      activePrice = parseFloat(product.variants[0].price?.amount || activePrice);
      if (product.variants[0].compareAtPrice) {
        activeCompareAt = parseFloat(product.variants[0].compareAtPrice.amount);
      } else {
        activeCompareAt = (activePrice * 1.6).toFixed(2);
      }
    }
  }
  
  // Ensure we have at least 2 images for the carousel to work if they only uploaded 1
  let displayImages = product.images;
  if (displayImages.length === 1) {
    displayImages = [displayImages[0], displayImages[0], displayImages[0]]; // Duplicate for visual effect
  } else if (displayImages.length === 0) {
    displayImages = [{ src: '/images/world_cup.png', id: 'fallback' }];
  }

  return (
    <main className="product-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/world-cup">World Cup 2026</Link> / {product.title}
      </div>

      <div className="product-image-section">
        <span className="selling-fast-badge">SELLING FAST</span>
        
        <div className="carousel-track" ref={carouselRef} onScroll={handleScroll}>
          {displayImages.map((img, i) => (
            <div key={img.id + i} className="carousel-slide">
              <img src={img.src} alt={product.title} className="product-main-img" />
            </div>
          ))}
        </div>

        <div className="carousel-dots">
          {displayImages.map((_, idx) => (
            <div 
              key={idx} 
              className={`dot ${activeImageIndex === idx ? 'active' : ''}`}
              onClick={() => scrollToImage(idx)}
            ></div>
          ))}
        </div>
      </div>

      <div className="product-details-container">
        <div className="product-meta-row">
          <div className="team-badge">
            <span className="flag-icon">🇩🇪</span> 
            {mainTitle.split(' ')[0]} NATIONAL TEAM
          </div>
          <div className="product-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span className="rating-score">4.9</span>
            <span className="rating-reviews">(128 Reviews)</span>
          </div>
        </div>

        <h1 className="product-title-large">{mainTitle}</h1>
        <h2 className="product-subtitle-large">{subTitle}</h2>

        <div className="price-row">
          <span className="current-price">₹{parseFloat(activePrice).toFixed(2)}</span>
          <span className="compare-price">₹{parseFloat(activeCompareAt).toFixed(2)}</span>
          <span className="discount-badge">
            {Math.round((1 - (activePrice / activeCompareAt)) * 100)}% OFF
          </span>
        </div>

        <div className="selector-section">
          <div className="selector-header" style={{ position: 'relative' }}>
            <span className="selector-label">Version</span>
            <span 
              className="selector-helper" 
              onClick={() => setShowVersionInfo(!showVersionInfo)}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Player vs Fan ?
            </span>

            {showVersionInfo && (
              <div className="version-info-popup" style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                background: '#1a1a1a',
                border: '1px solid #333',
                padding: '16px',
                borderRadius: '8px',
                width: '280px',
                zIndex: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                color: '#fff',
                fontSize: '13px',
                lineHeight: '1.5',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ color: '#ccff00', fontSize: '14px' }}>Version Guide</strong>
                  <svg onClick={() => setShowVersionInfo(false)} style={{ cursor: 'pointer' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
                <p style={{ margin: '0 0 10px 0', color: '#e4e4e7' }}><strong style={{color: '#fff'}}>Player version</strong> comes with heat-pressed logos and premium performance fabric - closest to what players wear on the pitch.</p>
                <p style={{ margin: '0', color: '#e4e4e7' }}><strong style={{color: '#fff'}}>Fan version</strong> has a more relaxed fit with embroidered logos - comfortable for everyday wear.</p>
              </div>
            )}
          </div>
          <div className="version-options">
            <button 
              className={`version-btn ${selectedVersion === 'Player' ? 'active' : ''}`}
              onClick={() => setSelectedVersion('Player')}
            >
              <strong>Player</strong>
              <span>Premium fit, heat-applied</span>
            </button>
            <button 
              className={`version-btn ${selectedVersion === 'Fan' ? 'active' : ''}`}
              onClick={() => setSelectedVersion('Fan')}
            >
              <strong>Fan</strong>
              <span>Relaxed fit, embroidered</span>
            </button>
          </div>
        </div>

        <div className="selector-section">
          <div className="selector-header" style={{ position: 'relative' }}>
            <span className="selector-label">Select Size</span>
            <span 
              className="selector-helper"
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              Size Guide
            </span>
            
            {showSizeGuide && (
              <div className="size-guide-popup" style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                background: '#1a1a1a',
                border: '1px solid #333',
                padding: '16px',
                borderRadius: '8px',
                width: '200px',
                zIndex: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                color: '#e4e4e7',
                fontSize: '13px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <strong style={{ color: '#ccff00', fontSize: '14px' }}>Size Chart (Chest)</strong>
                  <svg onClick={() => setShowSizeGuide(false)} style={{ cursor: 'pointer' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '6px' }}><strong style={{color: '#fff'}}>S</strong><span>36"</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '6px' }}><strong style={{color: '#fff'}}>M</strong><span>38"</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '6px' }}><strong style={{color: '#fff'}}>L</strong><span>40"</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '6px' }}><strong style={{color: '#fff'}}>XL</strong><span>42"</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px' }}><strong style={{color: '#fff'}}>XXL</strong><span>44"</span></div>
                </div>
              </div>
            )}
          </div>
          <div className="size-options">
            {['S', 'M', 'L', 'XL', '2XL'].map(size => (
              <button 
                key={size}
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
          <div className="addon-card" style={{ opacity: 0.6, pointerEvents: 'none' }}>
          <div className="addon-header">
            <div className="addon-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Add Name & Number</span>
            </div>
            <span className="addon-price-pill">+₹{customPrintPrice}</span>
          </div>
          <p className="addon-subtitle">Official player-style printing.</p>
          <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: '500', marginTop: '8px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
            Customization of jerseys has been paused for a limited time.
          </p>
        </div>

        <div className="addon-card" style={{ opacity: 0.6, pointerEvents: 'none' }}>
          <div className="addon-header">
            <div className="addon-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Add Badge</span>
            </div>
            <span className="addon-price-pill">+₹{sleeveBadgePrice}</span>
          </div>
          <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: '500', margin: '12px 0', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
            Customization of jerseys has been paused for a limited time.
          </p>
          <div className="badge-grid" style={{ pointerEvents: 'none' }}>
            {[
              { id: 'FIFA Qualifiers', src: '/images/badge_qualifiers.jpg' },
              { id: 'Football Unites The World', src: '/images/badge_unites.jpg' },
              { id: 'FIFA World Cup Winners', src: '/images/badge_fifa.jpg' },
              { id: 'World Cup 2026', src: '/images/badge_2026.jpg' }
            ].map(badge => (
              <div 
                key={badge.id}
                className={`badge-item ${selectedBadge === badge.id ? 'active' : ''}`}
              >
                <img src={badge.src} alt="Badge Option" className="badge-content" />
                {selectedBadge === badge.id && (
                  <div className="badge-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button 
          className="add-to-cart-btn-neon" 
          disabled={selectedVersion === 'Fan'}
          style={selectedVersion === 'Fan' ? { opacity: 0.5, cursor: 'not-allowed', background: '#333', color: '#888' } : {}}
          onClick={() => {
          if (selectedVersion === 'Fan') return;
          let variantId = product.variants[0]?.id;
          if (product.variants && product.variants.length > 0) {
            const matched = product.variants.find(v => 
              v.title.toLowerCase().includes(selectedVersion.toLowerCase()) && 
              v.title.toLowerCase().includes(selectedSize.toLowerCase())
            );
            if (matched) variantId = matched.id;
          }

          let extraPrice = 0;
          if (nameInput || numberInput) extraPrice += customPrintPrice;
          if (selectedBadge && selectedBadge !== 'none') extraPrice += sleeveBadgePrice;
          addToCart({
            title: product.title,
            image: product.images[0]?.src || '/images/world_cup.png',
            price: parseFloat(activePrice) + extraPrice,
            version: selectedVersion,
            size: selectedSize,
            name: nameInput,
            number: numberInput,
            badge: selectedBadge,
            variantId: variantId
          });
        }}>
          {selectedVersion === 'Fan' ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
        
        <ul className="guarantee-list">
          <li>• Premium Quality Guaranteed</li>
          <li>• Delivery in 4-8 business days.</li>
          <li>• 24-48 hours dispatch time.</li>
          <li>• 4-7 days extra for customization.</li>
          <li>• Secure Payments</li>
          <li>• Pan India Delivery</li>
        </ul>

        <div className="accordion-section">
          {[
            { 
              id: 'details', 
              title: 'Product Details',
              content: (
                <div className="product-details-content">
                  <p>
                    The {product.title} is crafted for fans who want elite-level football aesthetics with premium comfort and performance. Inspired by the latest international design language, this jersey features lightweight breathable fabric, athletic tailoring, and professional-grade detailing for a true matchday feel. Whether you're playing on turf, supporting your club, or styling it casually, this jersey delivers a modern football culture look with maximum comfort.
                  </p>
                  <h4 className="key-features-title">KEY FEATURES</h4>
                  <ul className="key-features-list">
                    <li>Player Edition Match Quality</li>
                    <li>Breathable Sweat-Wicking Fabric</li>
                    <li>Slim Athletic Fit</li>
                    <li>Premium Heat-Pressed Logos</li>
                    <li>Lightweight Performance Construction</li>
                    <li>Stretch Comfort Material</li>
                    <li>Suitable For Matchday & Casual Wear</li>
                    <li>Custom Name & Number Available</li>
                  </ul>
                </div>
              )
            },
            { 
              id: 'shipping', 
              title: 'Shipping Policy',
              content: (
                <div className="policy-content">
                  <p>All orders placed on <strong>ELVN</strong> are subject to product availability. In certain cases, some products may be available on a pre-order basis due to high demand or limited stock availability. If your selected item is currently unavailable for immediate dispatch, your order will be processed and shipped as soon as the product becomes available.</p>
                  
                  <p>We are committed to keeping you informed throughout the process.</p>
                  
                  <h4>Delivery Locations</h4>
                  <p>At present, ELVN ships exclusively within India.</p>
                  <p>We currently do not offer international shipping outside the geographical boundaries of India.</p>
                  
                  <h4>Processing & Delivery Time</h4>
                  <p>Once your order is successfully placed and confirmed, our team begins processing it for dispatch.</p>
                  
                  <h4>Estimated Delivery Timeline:</h4>
                  <ul>
                    <li>Standard Orders: <strong>5–10 Business Days</strong></li>
                    <li>Customized Jerseys: Additional <strong>4–7 Business Days</strong></li>
                  </ul>
                  
                  <p>Business days refer to Monday through Saturday, excluding public holidays.</p>
                  
                  <p>Please note:</p>
                  <ul>
                    <li>Orders are not shipped on Sundays or major public holidays.</li>
                    <li>Delivery timelines are estimated and may vary depending on your location, courier operations, and order volume.</li>
                  </ul>
                  
                  <p>In certain situations, items within the same order may arrive separately to ensure faster delivery.</p>
                  
                  <h4>Important Delivery Notice</h4>
                  <p>During festival seasons, sale periods, extreme weather conditions, or unforeseen logistical disruptions, deliveries may experience slight delays due to courier or transportation limitations.</p>
                  <p>We sincerely appreciate your patience and understanding in such situations.</p>
                  <p>Please note that once an order is confirmed, cancellation requests will not be accepted, including delays caused by courier operations, weather conditions, or festive rush periods.</p>
                  
                  <h4>Delivery Instructions</h4>
                  <p>You may add specific delivery instructions while placing your order at checkout. While we will do our best to accommodate them, fulfillment depends on courier service capabilities.</p>
                  
                  <h4>Shipping Charges</h4>
                  <p><strong>Free Shipping Across India</strong></p>
                  <p>We offer FREE shipping on all prepaid orders across India.</p>
                  <p>Additional shipping charges, if any, will be clearly displayed during checkout before payment confirmation.</p>
                  
                  <h4>Damaged or Missing Items</h4>
                  <p>We carefully inspect and pack every order before dispatch. However, if your package arrives damaged or if any item is missing, please contact us within <strong>24 hours of delivery</strong>.</p>
                  <p>To help us resolve the issue quickly, kindly share:</p>
                  <ul>
                    <li>Order ID</li>
                    <li>Unboxing video/photos</li>
                    <li>Images of the packaging and product received</li>
                  </ul>
                  <p>Claims reported after 24 hours of delivery may not be eligible for verification or resolution.</p>
                  
                  <h4>Need Help?</h4>
                  <p>For any questions regarding shipping, tracking, or delivery, feel free to contact our support team.</p>
                  <p><strong>ELVN Support</strong><br/>📞 +91 8075642079</p>
                  <p>We're always here to help.</p>
                </div>
              )
            },
            { 
              id: 'returns', 
              title: 'Refund & Return Policy',
              content: (
                <div className="policy-content">
                  <p>At ELVN, we strive to deliver premium-quality football jerseys and a smooth shopping experience for every customer. Please read our Refund & Return Policy carefully before placing an order.</p>
                  
                  <h4>Order Cancellation</h4>
                  <p>Orders can only be cancelled within 2 hours of placing the order.</p>
                  <p>After this period, cancellation requests may not be accepted as the order may already be processed or prepared for dispatch.</p>
                  <p>To request a cancellation, please contact us with:</p>
                  <ul>
                    <li>Your Order ID</li>
                    <li>Purchase details</li>
                    <li>Reason for cancellation</li>
                  </ul>
                  
                  <h4>Contact Support</h4>
                  <p>✉ support@elvn.in<br/>📞 WhatsApp: +91 8075642079</p>
                  <p>Cancellation approval is subject to order processing status.</p>
                  
                  <h4>Returns & Exchanges</h4>
                  <p><strong>Important Notice</strong></p>
                  <p><strong>Customized Products</strong><br/>Customized jerseys (name printing, number printing, patches, badges, etc.) are strictly non-returnable and <strong>non-refundable</strong> under any circumstances.</p>
                  <p><strong>Size-Related Issues</strong><br/>Please refer to our size guide carefully before placing your order. Returns or refunds for incorrect size selection are not applicable.</p>
                  
                  <h4>Eligible Return Conditions</h4>
                  <p>Returns or exchanges are only accepted in the following cases:</p>
                  <ul>
                    <li>Manufacturing defects</li>
                    <li>Damaged product received</li>
                    <li>Incorrect item delivered</li>
                    <li>Damage during transit</li>
                  </ul>
                  <p>Any issue must be reported within <strong>24 hours</strong> of delivery along with proper proof.</p>
                  <p>To initiate a claim, please share:</p>
                  <ul>
                    <li>Order ID</li>
                    <li>Unboxing video</li>
                    <li>Clear photos of the product and packaging</li>
                  </ul>
                  <p>Claims raised beyond 24 hours of delivery may not be eligible for review.</p>
                  
                  <h4>Return Eligibility</h4>
                  <p>To qualify for a return:</p>
                  <ul>
                    <li>The item must be unused and unwashed</li>
                    <li>All original tags and packaging must be intact</li>
                    <li>Product must be returned in the same condition as received</li>
                    <li>Proof of purchase/order confirmation is required</li>
                  </ul>
                  <p>ELVN reserves the right to reject returns that do not meet these conditions.</p>
                  
                  <h4>Exchanges</h4>
                  <p>We only replace products if:</p>
                  <ul>
                    <li>The item received is defective</li>
                    <li>The wrong item was delivered</li>
                    <li>The product was damaged during shipping</li>
                  </ul>
                  <p>Approved exchanges will only be processed for the same product variant, subject to availability.</p>
                  <p>To request an exchange, contact:<br/>✉ support@elvn.in</p>
                  
                  <h4>Refund Process</h4>
                  <p>Once your returned item is received and inspected, our team will notify you regarding the approval or rejection of your refund request.</p>
                  <p>If approved:</p>
                  <ul>
                    <li>Refunds will be processed to the original payment method</li>
                    <li>Processing time may vary depending on your bank or payment provider</li>
                    <li>Refunds generally reflect within 5–10 business days</li>
                  </ul>
                  
                  <h4>Late or Missing Refunds</h4>
                  <p>If you haven't received your refund:</p>
                  <ol>
                    <li>Recheck your bank account or payment method</li>
                    <li>Contact your bank or payment provider</li>
                    <li>Allow additional processing time</li>
                  </ol>
                  <p>If the issue still persists, contact us at:<br/>✉ support@elvn.in</p>
                  
                  <h4>Sale & Promotional Items</h4>
                  <p>Products purchased during sales, special promotions, discount campaigns, or clearance events may not be eligible for refunds or returns unless the item received is defective or incorrect.</p>
                  
                  <h4>Return Shipping</h4>
                  <p>Customers are responsible for return shipping costs unless the return is approved due to:</p>
                  <ul>
                    <li>Manufacturing defect</li>
                    <li>Wrong product delivery</li>
                    <li>Transit damage</li>
                  </ul>
                  <p>Shipping charges are non-refundable.</p>
                  <p>For valuable returns, we recommend using a trackable courier service, as ELVN cannot guarantee receipt of returned shipments without tracking confirmation.</p>
                  
                  <h4>Need Assistance?</h4>
                  <p>Our support team is always here to help you.</p>
                  <p><strong>ELVN Customer Support</strong><br/>✉ support@elvn.in<br/>📞 +91 8075642079</p>
                </div>
              )
            }
          ].map((item) => (
            <div 
              key={item.id} 
              className={`accordion-item ${openAccordion === item.id ? 'active' : ''}`} 
            >
              <div className="accordion-header" onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}>
                <span>{item.title}</span>
                <svg 
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
                  style={{ transform: openAccordion === item.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {openAccordion === item.id && (
                <div className="accordion-content">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

function ShippingReturnsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="policy-page" style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7' }}>
      <div className="policy-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ color: '#ccff00', fontSize: '28px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Shipping Policy</h1>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>All orders placed on ELVN are subject to product availability. In certain cases, some products may be available on a pre-order basis due to high demand or limited stock availability. If your selected item is currently unavailable for immediate dispatch, your order will be processed and shipped as soon as the product becomes available.</p>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>We are committed to keeping you informed throughout the process.</p>
        
        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Delivery Locations</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>At present, ELVN ships exclusively within India.<br/>We currently do not offer international shipping outside the geographical boundaries of India.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Processing & Delivery Time</h2>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Once your order is successfully placed and confirmed, our team begins processing it for dispatch.</p>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}><strong style={{color: '#fff'}}>Estimated Delivery Timeline:</strong><br/>Standard Orders: 5–10 Business Days<br/>Customized Jerseys: Additional 4–7 Business Days<br/>Business days refer to Monday through Saturday, excluding public holidays.</p>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}><strong style={{color: '#fff'}}>Please note:</strong><br/>Orders are not shipped on Sundays or major public holidays.<br/>Delivery timelines are estimated and may vary depending on your location, courier operations, and order volume.<br/>In certain situations, items within the same order may arrive separately to ensure faster delivery.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Important Delivery Notice</h2>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>During festival seasons, sale periods, extreme weather conditions, or unforeseen logistical disruptions, deliveries may experience slight delays due to courier or transportation limitations.</p>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>We sincerely appreciate your patience and understanding in such situations.<br/>Please note that once an order is confirmed, cancellation requests will not be accepted, including delays caused by courier operations, weather conditions, or festive rush periods.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Delivery Instructions</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>You may add specific delivery instructions while placing your order at checkout. While we will do our best to accommodate them, fulfillment depends on courier service capabilities.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Shipping Charges</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}><strong style={{color: '#fff'}}>Free Shipping Across India</strong><br/>We offer FREE shipping on all prepaid orders across India.<br/>Additional shipping charges, if any, will be clearly displayed during checkout before payment confirmation.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Damaged or Missing Items</h2>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>We carefully inspect and pack every order before dispatch. However, if your package arrives damaged or if any item is missing, please contact us within 24 hours of delivery.</p>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>To help us resolve the issue quickly, kindly share:<br/>- Order ID<br/>- Unboxing video/photos<br/>- Images of the packaging and product received<br/>Claims reported after 24 hours of delivery may not be eligible for verification or resolution.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Need Help?</h2>
        <p style={{ marginBottom: '64px', lineHeight: '1.6' }}>For any questions regarding shipping, tracking, or delivery, feel free to contact our support team.<br/><strong style={{color: '#fff'}}>ELVN Support</strong><br/>📞 +91 8075642079<br/>We're always here to help.</p>

        <h1 style={{ color: '#ccff00', fontSize: '28px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Refund & Return Policy</h1>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>At ELVN, we strive to deliver premium-quality football jerseys and a smooth shopping experience for every customer. Please read our Refund & Return Policy carefully before placing an order.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Order Cancellation</h2>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Orders can only be cancelled within 2 hours of placing the order.<br/>After this period, cancellation requests may not be accepted as the order may already be processed or prepared for dispatch.</p>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>To request a cancellation, please contact us with:<br/>- Your Order ID<br/>- Purchase details<br/>- Reason for cancellation<br/><strong style={{color: '#fff'}}>Contact Support</strong><br/>✉ support@elvn.in<br/>📞 WhatsApp: +91 8075642079<br/>Cancellation approval is subject to order processing status.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Returns & Exchanges</h2>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}><strong style={{color: '#ff4444'}}>Important Notice</strong></p>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}><strong style={{color: '#fff'}}>Customized Products</strong><br/>Customized jerseys (name printing, number printing, patches, badges, etc.) are strictly non-returnable and non-refundable under any circumstances.</p>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}><strong style={{color: '#fff'}}>Size-Related Issues</strong><br/>Please refer to our size guide carefully before placing your order. Returns or refunds for incorrect size selection are not applicable.</p>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}><strong style={{color: '#fff'}}>Eligible Return Conditions</strong><br/>Returns or exchanges are only accepted in the following cases:<br/>- Manufacturing defects<br/>- Damaged product received<br/>- Incorrect item delivered<br/>- Damage during transit<br/>Any issue must be reported within 24 hours of delivery along with proper proof.</p>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>To initiate a claim, please share:<br/>- Order ID<br/>- Unboxing video<br/>- Clear photos of the product and packaging<br/>Claims raised beyond 24 hours of delivery may not be eligible for review.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Return Eligibility</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>To qualify for a return:<br/>- The item must be unused and unwashed<br/>- All original tags and packaging must be intact<br/>- Product must be returned in the same condition as received<br/>- Proof of purchase/order confirmation is required<br/>ELVN reserves the right to reject returns that do not meet these conditions.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Exchanges</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>We only replace products if:<br/>- The item received is defective<br/>- The wrong item was delivered<br/>- The product was damaged during shipping<br/>Approved exchanges will only be processed for the same product variant, subject to availability.<br/>To request an exchange, contact: ✉ support@elvn.in</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Refund Process</h2>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Once your returned item is received and inspected, our team will notify you regarding the approval or rejection of your refund request.</p>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>If approved:<br/>- Refunds will be processed to the original payment method<br/>- Processing time may vary depending on your bank or payment provider<br/>- Refunds generally reflect within 5–10 business days</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Late or Missing Refunds</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>If you haven't received your refund:<br/>- Recheck your bank account or payment method<br/>- Contact your bank or payment provider<br/>- Allow additional processing time<br/>If the issue still persists, contact us at: ✉ support@elvn.in</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Sale & Promotional Items</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>Products purchased during sales, special promotions, discount campaigns, or clearance events may not be eligible for refunds or returns unless the item received is defective or incorrect.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Return Shipping</h2>
        <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Customers are responsible for return shipping costs unless the return is approved due to:<br/>- Manufacturing defect<br/>- Wrong product delivery<br/>- Transit damage<br/>Shipping charges are non-refundable.</p>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>For valuable returns, we recommend using a trackable courier service, as ELVN cannot guarantee receipt of returned shipments without tracking confirmation.</p>

        <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>Need Assistance?</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6' }}>Our support team is always here to help you.<br/><strong style={{color: '#fff'}}>ELVN Customer Support</strong><br/>✉ support@elvn.in<br/>📞 +91 8075642079</p>

      </div>
      <Footer />
    </main>
  );
}

function SizeGuidePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <main className="policy-page" style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7' }}>
      <div className="policy-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ color: '#ccff00', fontSize: '28px', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '1px' }}>Fit & Size Guide</h1>
        
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '24px', marginBottom: '48px' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>Size Chart (Chest)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px', fontSize: '16px' }}><strong style={{color: '#fff'}}>S</strong><span>36"</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px', fontSize: '16px' }}><strong style={{color: '#fff'}}>M</strong><span>38"</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px', fontSize: '16px' }}><strong style={{color: '#fff'}}>L</strong><span>40"</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px', fontSize: '16px' }}><strong style={{color: '#fff'}}>XL</strong><span>42"</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', fontSize: '16px' }}><strong style={{color: '#fff'}}>XXL</strong><span>44"</span></div>
          </div>
        </div>

        <h2 style={{ color: '#ccff00', fontSize: '24px', marginBottom: '24px', textTransform: 'uppercase' }}>Player vs Fan Version</h2>
        <p style={{ marginBottom: '32px', lineHeight: '1.6', fontSize: '16px' }}>Understanding the difference between the Player and Fan versions helps you choose the perfect fit for your needs. While both feature identical designs, the construction and materials differ significantly.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/images/player-logo.jpg" alt="Player Version Heat Pressed" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
            <div style={{ padding: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '12px' }}>Player Version</h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#a1a1aa' }}>
                <li><strong style={{color: '#e4e4e7'}}>Performance Fit:</strong> Tighter, athletic cut designed for movement.</li>
                <li><strong style={{color: '#e4e4e7'}}>Heat-Pressed Logos:</strong> Ultra-lightweight rubberized crests and sponsor logos to reduce weight and friction.</li>
                <li><strong style={{color: '#e4e4e7'}}>Premium Fabric:</strong> Highly breathable, moisture-wicking technology (like ADV, Dri-FIT ADV, or HEAT.RDY).</li>
                <li><strong style={{color: '#e4e4e7'}}>Authenticity:</strong> This is the exact specification worn by players on the pitch.</li>
              </ul>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
            <img src="/images/fan-logo.jpg" alt="Fan Version Embroidered" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
            <div style={{ padding: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '12px' }}>Fan Version</h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#a1a1aa' }}>
                <li><strong style={{color: '#e4e4e7'}}>Relaxed Fit:</strong> Looser, more comfortable cut designed for everyday wear and casual styling.</li>
                <li><strong style={{color: '#e4e4e7'}}>Embroidered Logos:</strong> Durable, stitched-on team crests and logos that offer longevity and a classic feel.</li>
                <li><strong style={{color: '#e4e4e7'}}>Standard Fabric:</strong> Standard moisture-wicking technology (like AEROREADY or standard Dri-FIT) that is durable and easy to maintain.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}

function StickyCart() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, customPrintPrice, sleeveBadgePrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const checkout = await shopifyClient.checkout.create();
      
      const customPrintQuery = await shopifyClient.product.fetchQuery({ query: 'title:"Custom Print Add-on"' });
      const customPrintVariantId = customPrintQuery.length > 0 ? customPrintQuery[0].variants[0].id : null;

      const sleeveBadgeQuery = await shopifyClient.product.fetchQuery({ query: 'title:"Sleeve Badge Add-on"' });
      const sleeveBadgeProduct = sleeveBadgeQuery.length > 0 ? sleeveBadgeQuery[0] : null;

      const lineItemsToAdd = [];
      let totalCustomPrints = 0;
      let badgeCounts = {};

      cartItems.forEach(item => {
        const customAttributes = [
          { key: "Version", value: item.version },
          { key: "Size", value: item.size }
        ];
        
        let hasPrint = false;
        if (item.name) {
          customAttributes.push({ key: "Custom Name", value: item.name });
          hasPrint = true;
        }
        if (item.number) {
          customAttributes.push({ key: "Custom Number", value: item.number });
          hasPrint = true;
        }
        if (hasPrint) totalCustomPrints++;

        if (item.badge && item.badge !== 'none') {
          customAttributes.push({ key: "Badge", value: item.badge });
          badgeCounts[item.badge] = (badgeCounts[item.badge] || 0) + 1;
        }

        lineItemsToAdd.push({
          variantId: item.variantId,
          quantity: 1,
          customAttributes: customAttributes
        });
      });

      if (totalCustomPrints > 0 && customPrintVariantId) {
        lineItemsToAdd.push({
          variantId: customPrintVariantId,
          quantity: totalCustomPrints
        });
      }

      if (sleeveBadgeProduct) {
        Object.entries(badgeCounts).forEach(([badgeName, count]) => {
          const matchedVariant = sleeveBadgeProduct.variants.find(v => v.title.toLowerCase().includes(badgeName.toLowerCase()));
          const vId = matchedVariant ? matchedVariant.id : sleeveBadgeProduct.variants[0].id;
          lineItemsToAdd.push({
            variantId: vId,
            quantity: count
          });
        });
      }

      await shopifyClient.checkout.addLineItems(checkout.id, lineItemsToAdd);
      window.location.href = checkout.webUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error starting checkout. Please try again.");
      setIsCheckingOut(false);
    }
  };

  if (cartItems.length === 0) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      <div className="sticky-cart-bar" onClick={() => setIsCartOpen(true)}>
        <div className="sticky-cart-left">
          <span className="sticky-cart-title">Secure your gear before it sells out! 🔥</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="sticky-cart-total">₹{totalAmount.toFixed(2)}</span>
            <span className="sticky-cart-count">{cartItems.length} ITEM{cartItems.length > 1 ? 'S' : ''}</span>
          </div>
        </div>
        <div className="sticky-cart-right">
          <span style={{ fontWeight: 'bold' }}>CART</span>
          <div className="cart-images-preview">
            {cartItems.slice(0, 3).map((item, idx) => (
              <img key={idx} src={item.image} alt="Cart item" />
            ))}
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>

      {isCartOpen && (
        <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-modal-content" onClick={e => e.stopPropagation()}>
            <div className="cart-modal-header">
              <h3>Your Cart</h3>
              <button onClick={() => setIsCartOpen(false)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <img src={item.image} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.title}</h4>
                    <p>Version: {item.version} | Size: {item.size}</p>
                    {item.badge && item.badge !== 'none' && <p>Badge: {item.badge}</p>}
                    {(item.name || item.number) && <p>Print: {item.name} {item.number}</p>}
                    <span className="cart-item-price" style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                      <span style={{fontSize: '12px', color: '#888'}}>
                        Base: ₹{(item.price - (item.name || item.number ? customPrintPrice : 0) - (item.badge && item.badge !== 'none' ? sleeveBadgePrice : 0)).toFixed(2)}
                        {(item.name || item.number) ? ` | Print: +₹${customPrintPrice}` : ''}
                        {(item.badge && item.badge !== 'none') ? ` | Badge: +₹${sleeveBadgePrice}` : ''}
                      </span>
                      <strong style={{fontSize: '15px'}}>Total: ₹{item.price.toFixed(2)}</strong>
                    </span>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(index)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-modal-footer">
              <div className="cart-modal-total">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? 'PREPARING SECURE CHECKOUT...' : 'PROCEED TO CHECKOUT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ContactUsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <main className="policy-page" style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7' }}>
      <div className="policy-container" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: '900', letterSpacing: '-1px', color: '#ccff00' }}>CONTACT US</h1>
        <p style={{ color: '#a1a1aa', marginBottom: '40px' }}>We're here to help. Reach out to us through any of the channels below.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <a href="mailto:elvnstore.online@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: '#1a1a1a', borderRadius: '12px', textDecoration: 'none', color: '#ffffff', border: '1px solid #333', transition: 'border-color 0.2s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Email Us</div>
              <div style={{ fontSize: '14px', color: '#a1a1aa' }}>elvnstore.online@gmail.com</div>
            </div>
          </a>
          
          <a href="https://wa.me/918075642079" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: '#1a1a1a', borderRadius: '12px', textDecoration: 'none', color: '#ffffff', border: '1px solid #333', transition: 'border-color 0.2s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>WhatsApp</div>
              <div style={{ fontSize: '14px', color: '#a1a1aa' }}>+91 8075642079</div>
            </div>
          </a>

          <a href="https://instagram.com/elvnstore.in" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: '#1a1a1a', borderRadius: '12px', textDecoration: 'none', color: '#ffffff', border: '1px solid #333', transition: 'border-color 0.2s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Instagram</div>
              <div style={{ fontSize: '14px', color: '#a1a1aa' }}>@elvnstore.in</div>
            </div>
          </a>
        </div>
      </div>
      <FooterCTA />
      <Footer />
    </main>
  );
}

function FAQPage() {
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      id: 'q1',
      question: 'What is the difference between Player and Fan versions?',
      answer: 'Player versions come with heat-pressed logos and premium, lightweight performance fabric. It is a slim, athletic fit identical to what players wear on the pitch. Fan versions feature a more relaxed, comfortable fit with embroidered logos, perfect for everyday streetwear.'
    },
    {
      id: 'q2',
      question: 'How long does shipping take?',
      answer: 'Standard orders take 5–10 business days to arrive. If you requested custom name and number printing, please allow an additional 4–7 business days for processing before dispatch.'
    },
    {
      id: 'q3',
      question: 'Do you ship internationally?',
      answer: 'At present, ELVN ships exclusively within India. We currently do not offer international shipping outside the geographical boundaries of India.'
    },
    {
      id: 'q4',
      question: 'Can I cancel or return my order?',
      answer: 'Orders can only be cancelled within 2 hours of placing them. After this window, cancellation requests cannot be accepted as the order is already in processing. If your package arrives damaged or missing an item, please contact us with an unboxing video within 24 hours of delivery.'
    },
    {
      id: 'q5',
      question: 'How can I contact customer support?',
      answer: 'You can reach out to us anytime! Email us at elvnstore.online@gmail.com, WhatsApp us at +91 8075642079, or drop us a DM on Instagram @elvnstore.in.'
    }
  ];

  return (
    <main className="policy-page" style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7' }}>
      <div className="policy-container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px', fontWeight: '900', letterSpacing: '-1px', color: '#ccff00', textAlign: 'center' }}>FREQUENTLY ASKED QUESTIONS</h1>
        <p style={{ color: '#a1a1aa', marginBottom: '40px', textAlign: 'center' }}>Everything you need to know about our premium jerseys, shipping, and policies.</p>
        
        <div className="accordion-section">
          {faqs.map(faq => (
            <div 
              key={faq.id} 
              className={`accordion-item ${openAccordion === faq.id ? 'active' : ''}`}
            >
              <div className="accordion-header" onClick={() => setOpenAccordion(openAccordion === faq.id ? null : faq.id)}>
                <span>{faq.question}</span>
                <svg 
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: openAccordion === faq.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {openAccordion === faq.id && (
                <div className="accordion-content">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <FooterCTA />
      <Footer />
    </main>
  );
}

export default App;