import React, { useEffect, useState, useCallback } from 'react';
import apiService, {
  ProductResponse,
  CategoryResponse,
  WeeklyProductResponse,
  TestimonialResponse,
  TemplateData,
} from '../../services/apiService';
import './TemplateC.css';

interface TemplateCProps {
  data: TemplateData;
}

const TemplateC: React.FC<TemplateCProps> = ({ data }) => {
  const storeName: string = data.storeName || 'EcomBaker';

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [featured, setFeatured] = useState<WeeklyProductResponse[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [flashItems, setFlashItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      apiService.fetchProducts(0, 12),
      apiService.fetchCategories(0, 20),
      apiService.fetchActiveWeeklyProducts(),
      apiService.fetchApprovedTestimonials(0, 3),
    ])
      .then(([prodsPage, catsPage, weekly, testimonialsPage]) => {
        setProducts(prodsPage.content);
        setCategories(catsPage.content);
        setFeatured(weekly.filter(p => p.type === 'FEATURED' || p.type === 'SEASONAL').slice(0, 3));
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

  const totalCartItems = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = products.filter(p =>
    !activeCategory || p.category?.name === activeCategory
  );

  return (
    <div className="tc-root">
      {/* ── Sidebar ── */}
      <aside className="tc-sidebar">
        <div className="tc-sidebar-brand">
          <h2>{storeName}</h2>
          <span>{data.storeCode}</span>
        </div>

        <div className="tc-sidebar-search">
          <input type="text" placeholder="Search…" />
        </div>

        <nav className="tc-sidebar-nav">
          <p className="tc-nav-label">SHOP BY CATEGORY</p>
          <a
            href="#"
            className={!activeCategory ? 'active' : ''}
            onClick={e => { e.preventDefault(); setActiveCategory(null); }}
          >All Products</a>
          {categories.map(c => (
            <a
              key={c.id}
              href="#"
              className={activeCategory === c.name ? 'active' : ''}
              onClick={e => { e.preventDefault(); setActiveCategory(c.name); }}
            >{c.name}</a>
          ))}
        </nav>

        <div className="tc-sidebar-cart">
          <button onClick={() => {}}>🛒 Cart <span className="tc-cart-badge">{totalCartItems}</span></button>
        </div>

        <div className="tc-sidebar-footer">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Returns</a>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="tc-main">
        {/* ── Top bar ── */}
        <div className="tc-topbar">
          <span>Free delivery on orders over $49</span>
          <div className="tc-topbar-actions">
            <span>👤 Account</span>
            <span>❤️ Wishlist</span>
          </div>
        </div>

        {loading ? (
          <div className="tc-loading">Loading store…</div>
        ) : (
          <>
            {/* ── Editorial hero ── */}
            <section className="tc-hero">
              <div className="tc-hero-text">
                <p className="tc-hero-eyebrow">New Collection</p>
                <h1>{storeName}</h1>
                <p>Elegance in every detail — discover the new season</p>
                <button className="tc-hero-cta" onClick={() => setActiveCategory(null)}>Explore Now</button>
              </div>
            </section>

            {/* ── Featured items ── */}
            {featured.length > 0 && (
              <section className="tc-featured">
                <h2 className="tc-section-title">Featured This Season</h2>
                <div className="tc-featured-grid">
                  {featured.map(item => (
                    <div key={item.id} className="tc-featured-card">
                      {item.productImageURI
                        ? <img src={item.productImageURI} alt={item.productName} />
                        : <div className="tc-img-ph" />}
                      <div className="tc-featured-overlay">
                        <span className="tc-featured-type">{item.type.replace('_', ' ')}</span>
                        <h4>{item.productName}</h4>
                        <p>{item.categoryName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Products ── */}
            <section className="tc-products">
              <div className="tc-products-header">
                <h2 className="tc-section-title">{activeCategory || 'All Products'}</h2>
                <span>{filtered.length} items</span>
              </div>
              <div className="tc-product-grid">
                {filtered.map(product => (
                  <div key={product.id} className="tc-product-card">
                    {product.imageURI
                      ? <img src={product.imageURI} alt={product.name} />
                      : <div className="tc-img-ph" />}
                    <div className="tc-product-body">
                      <span className="tc-product-cat">{product.category?.name}</span>
                      <h4>{product.name}</h4>
                      <p className="tc-product-desc">{product.description}</p>
                      <div className="tc-product-row">
                        <span className="tc-product-price">${product.price?.toFixed(2)}</span>
                        <button
                          className={`tc-add-btn${flashItems.has(product.id) ? ' added' : ''}`}
                          onClick={() => addToCart(product)}
                          disabled={!product.isAvailable}
                        >
                          {flashItems.has(product.id) ? '✓' : product.isAvailable ? '+ Add' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Testimonials ── */}
            {testimonials.length > 0 && (
              <section className="tc-testimonials">
                <h2 className="tc-section-title">Customer Stories</h2>
                <div className="tc-testimonials-list">
                  {testimonials.map(t => (
                    <div key={t.id} className="tc-testimonial">
                      <div className="tc-stars">{'★'.repeat(t.rating)}</div>
                      <p>&ldquo;{t.content}&rdquo;</p>
                      <strong>— {t.name}{t.customerLocation ? `, ${t.customerLocation}` : ''}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <footer className="tc-footer">
          <p>© {new Date().getFullYear()} {storeName} · {data.storeCode}</p>
        </footer>
      </main>
    </div>
  );
};

export default TemplateC;
