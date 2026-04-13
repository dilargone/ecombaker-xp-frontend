import React, { useEffect, useState, useCallback } from 'react';
import apiService, {
  ProductResponse,
  CategoryResponse,
  WeeklyProductResponse,
  TemplateData,
} from '../../services/apiService';
import './TemplateD.css';

interface TemplateDProps {
  data: TemplateData;
}

const TemplateD: React.FC<TemplateDProps> = ({ data }) => {
  const storeName: string = data.storeName || 'EcomBaker';

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [drops, setDrops] = useState<WeeklyProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [flashItems, setFlashItems] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      apiService.fetchProducts(0, 12),
      apiService.fetchCategories(0, 20),
      apiService.fetchActiveWeeklyProducts(),
    ])
      .then(([prodsPage, catsPage, weekly]) => {
        setProducts(prodsPage.content);
        setCategories(catsPage.content);
        setDrops(weekly.filter(p => p.type === 'TRENDING' || p.type === 'HEAVY_DISCOUNT' || p.type === 'NEW_ARRIVAL').slice(0, 4));
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
  const totalCartPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const filtered = products.filter(p =>
    !activeCategory || p.category?.name === activeCategory
  );

  return (
    <div className="td-root">
      {/* ── Navbar ── */}
      <header className="td-header">
        <div className="td-header-inner">
          <button className="td-menu-btn" onClick={() => setMenuOpen(o => !o)}>☰</button>
          <div className="td-logo">{storeName.toUpperCase()}</div>
          <button className="td-cart-btn">
            BAG {totalCartItems > 0 && <span className="td-cart-badge">{totalCartItems}</span>}
          </button>
        </div>

        {/* Mobile/slide-out category menu */}
        {menuOpen && (
          <nav className="td-menu">
            <button className="td-menu-close" onClick={() => setMenuOpen(false)}>✕</button>
            <a href="#" onClick={e => { e.preventDefault(); setActiveCategory(null); setMenuOpen(false); }}>ALL</a>
            {categories.map(c => (
              <a key={c.id} href="#" onClick={e => { e.preventDefault(); setActiveCategory(c.name); setMenuOpen(false); }}>
                {c.name.toUpperCase()}
              </a>
            ))}
          </nav>
        )}
      </header>

      {loading ? (
        <div className="td-loading">LOADING…</div>
      ) : (
        <main className="td-main">
          {/* ── Hero ── */}
          <section className="td-hero">
            <div className="td-hero-content">
              <p className="td-hero-eyebrow">LATEST DROP</p>
              <h1>{storeName.toUpperCase()}</h1>
              <p className="td-hero-sub">LIMITED EDITION · EXCLUSIVE RELEASES</p>
              <button className="td-hero-cta" onClick={() => setActiveCategory(null)}>
                SHOP THE DROP →
              </button>
            </div>
          </section>

          {/* ── Drops/Trending ── */}
          {drops.length > 0 && (
            <section className="td-drops">
              <h2 className="td-section-title">
                <span className="td-accent">✦</span> TRENDING NOW
              </h2>
              <div className="td-drops-grid">
                {drops.map(item => (
                  <div key={item.id} className="td-drop-card">
                    {item.productImageURI
                      ? <img src={item.productImageURI} alt={item.productName} />
                      : <div className="td-img-ph" />}
                    <div className="td-drop-overlay">
                      {item.discountPercentage > 0 && (
                        <span className="td-discount-tag">-{item.discountPercentage}%</span>
                      )}
                      <span className="td-drop-type">{item.type.replace('_', ' ')}</span>
                      <h4>{item.productName.toUpperCase()}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Category strip ── */}
          <div className="td-cat-strip">
            <button className={`td-cat-btn${!activeCategory ? ' active' : ''}`} onClick={() => setActiveCategory(null)}>ALL</button>
            {categories.map(c => (
              <button key={c.id} className={`td-cat-btn${activeCategory === c.name ? ' active' : ''}`} onClick={() => setActiveCategory(c.name)}>
                {c.name.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ── Product grid ── */}
          <section className="td-products">
            <div className="td-products-header">
              <h2 className="td-section-title">{activeCategory ? activeCategory.toUpperCase() : 'ALL PRODUCTS'}</h2>
              <span className="td-count">{filtered.length} ITEMS</span>
            </div>
            <div className="td-product-grid">
              {filtered.map(product => (
                <div key={product.id} className="td-product-card">
                  <div className="td-product-img-wrap">
                    {product.imageURI
                      ? <img src={product.imageURI} alt={product.name} />
                      : <div className="td-img-ph" />}
                    {!product.isAvailable && <div className="td-sold-out">SOLD OUT</div>}
                  </div>
                  <div className="td-product-info">
                    <span className="td-product-cat">{product.category?.name?.toUpperCase()}</span>
                    <h4>{product.name.toUpperCase()}</h4>
                    <div className="td-product-row">
                      <span className="td-product-price">${product.price?.toFixed(2)}</span>
                      <button
                        className={`td-add-btn${flashItems.has(product.id) ? ' added' : ''}${!product.isAvailable ? ' disabled' : ''}`}
                        onClick={() => product.isAvailable && addToCart(product)}
                        disabled={!product.isAvailable}
                      >
                        {flashItems.has(product.id) ? '✓ ADDED' : 'ADD TO BAG'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Cart summary bar ── */}
          {cart.length > 0 && (
            <div className="td-cart-bar">
              <span>{totalCartItems} ITEM{totalCartItems > 1 ? 'S' : ''} IN BAG</span>
              <span>${totalCartPrice.toFixed(2)}</span>
              <button className="td-checkout-btn">CHECKOUT →</button>
            </div>
          )}
        </main>
      )}

      <footer className="td-footer">
        <div className="td-footer-logo">{storeName.toUpperCase()}</div>
        <div className="td-footer-links">
          <a href="#">SHIPPING</a>
          <a href="#">RETURNS</a>
          <a href="#">SIZING</a>
          <a href="#">CONTACT</a>
        </div>
        <p>© {new Date().getFullYear()} {storeName.toUpperCase()} · {data.storeCode}</p>
      </footer>
    </div>
  );
};

export default TemplateD;
