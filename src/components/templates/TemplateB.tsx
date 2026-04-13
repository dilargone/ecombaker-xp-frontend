import React, { useEffect, useState, useCallback } from 'react';
import apiService, {
  ProductResponse,
  CategoryResponse,
  WeeklyProductResponse,
  TestimonialResponse,
} from '../../services/apiService';
import './TemplateB.css';

interface TemplateBProps {
  data: Record<string, any>;
}

const TemplateB: React.FC<TemplateBProps> = ({ data }) => {
  const storeName: string = data.storeName || 'EcomBaker';

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [newArrivals, setNewArrivals] = useState<WeeklyProductResponse[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [flashItems, setFlashItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      apiService.fetchProducts(0, 12),
      apiService.fetchCategories(0, 20),
      apiService.fetchActiveWeeklyProducts(),
      apiService.fetchApprovedTestimonials(0, 4),
    ])
      .then(([prodsPage, catsPage, weekly, testimonialsPage]) => {
        setProducts(prodsPage.content);
        setCategories(catsPage.content);
        setNewArrivals(weekly.filter(p => p.type === 'NEW_ARRIVAL' || p.type === 'TRENDING'));
        setTestimonials(testimonialsPage.content);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addToCart = useCallback((product: ProductResponse) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    setFlashItems(prev => new Set(prev).add(product.id));
    setTimeout(() => setFlashItems(prev => { const next = new Set(prev); next.delete(product.id); return next; }), 1200);
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const totalCartItems = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = products.filter(p =>
    !activeCategory || p.category?.name === activeCategory
  );

  return (
    <div className="tb-root">
      {/* ── Header ── */}
      <header className="tb-header">
        <nav className="tb-nav">
          <div className="tb-nav-links">
            <a href="#">New In</a>
            {categories.slice(0, 5).map(c => (
              <a key={c.id} href="#" onClick={e => { e.preventDefault(); setActiveCategory(c.name); }}>
                {c.name}
              </a>
            ))}
          </div>
          <div className="tb-logo">{storeName}</div>
          <div className="tb-nav-actions">
            <button>🔍</button>
            <button>👤</button>
            <button className="tb-cart-icn">🛒 {totalCartItems > 0 && <span className="tb-badge">{totalCartItems}</span>}</button>
          </div>
        </nav>
      </header>

      {loading ? (
        <div className="tb-loading">Loading…</div>
      ) : (
        <main className="tb-main">
          {/* ── Hero ── */}
          <section className="tb-hero">
            <div className="tb-hero-text">
              <p className="tb-hero-sub">New Season</p>
              <h1>{storeName}</h1>
              <p className="tb-hero-desc">Curated collections for the modern lifestyle</p>
              <button className="tb-hero-cta" onClick={() => setActiveCategory(null)}>Shop Now →</button>
            </div>
          </section>

          {/* ── New Arrivals ── */}
          {newArrivals.length > 0 && (
            <section className="tb-section">
              <h2 className="tb-section-title">New Arrivals</h2>
              <div className="tb-arrivals-grid">
                {newArrivals.slice(0, 4).map(item => (
                  <div key={item.id} className="tb-arrival-card">
                    {item.productImageURI
                      ? <img src={item.productImageURI} alt={item.productName} />
                      : <div className="tb-img-ph" />}
                    <div className="tb-arrival-label">
                      <span className="tb-tag">{item.type.replace('_', ' ')}</span>
                      <h4>{item.productName}</h4>
                      <p>{item.categoryName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Category pills ── */}
          <section className="tb-section">
            <div className="tb-pills">
              <button className={`tb-pill${!activeCategory ? ' active' : ''}`} onClick={() => setActiveCategory(null)}>All</button>
              {categories.map(c => (
                <button key={c.id} className={`tb-pill${activeCategory === c.name ? ' active' : ''}`} onClick={() => setActiveCategory(c.name)}>
                  {c.name}
                </button>
              ))}
            </div>
          </section>

          {/* ── Product grid ── */}
          <section className="tb-section">
            <h2 className="tb-section-title">{activeCategory || 'All Products'}</h2>
            <div className="tb-product-grid">
              {filtered.map(product => (
                <div key={product.id} className="tb-product-card">
                  <div className="tb-product-img-wrap">
                    {product.imageURI
                      ? <img src={product.imageURI} alt={product.name} />
                      : <div className="tb-img-ph" />}
                    <button
                      className={`tb-wishlist-btn${wishlist.has(product.id) ? ' active' : ''}`}
                      onClick={() => toggleWishlist(product.id)}
                    >
                      {wishlist.has(product.id) ? '♥' : '♡'}
                    </button>
                    <button
                      className="tb-quick-add"
                      onClick={() => addToCart(product)}
                      disabled={!product.isAvailable}
                    >
                      {flashItems.has(product.id) ? '✓ Added' : 'Quick Add'}
                    </button>
                  </div>
                  <div className="tb-product-info">
                    <span className="tb-product-cat">{product.category?.name}</span>
                    <h4>{product.name}</h4>
                    <p className="tb-product-price">${product.price?.toFixed(2)}</p>
                    {!product.isAvailable && <span className="tb-oos">Out of Stock</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Testimonials ── */}
          {testimonials.length > 0 && (
            <section className="tb-section tb-testimonials-section">
              <h2 className="tb-section-title">What Our Customers Say</h2>
              <div className="tb-testimonials-grid">
                {testimonials.map(t => (
                  <div key={t.id} className="tb-testimonial-card">
                    <div className="tb-stars">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                    <p className="tb-testimonial-content">"{t.content}"</p>
                    <div className="tb-testimonial-author">
                      {t.avatarUrl && <img src={t.avatarUrl} alt={t.name} />}
                      <div>
                        <strong>{t.name}</strong>
                        {t.customerLocation && <span>{t.customerLocation}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      <footer className="tb-footer">
        <div className="tb-footer-top">
          <div className="tb-footer-logo">{storeName}</div>
          <div className="tb-footer-links">
            <a href="#">About</a>
            <a href="#">Sustainability</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
        </div>
        <p className="tb-footer-copy">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TemplateB;
