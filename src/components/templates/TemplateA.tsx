import React, { useEffect, useState, useCallback } from 'react';
import apiService, {
  ProductResponse,
  CategoryResponse,
  WeeklyProductResponse,
  TemplateData,
} from '../../services/apiService';
import './TemplateA.css';

interface TemplateAProps {
  data: TemplateData;
}

const TemplateA: React.FC<TemplateAProps> = ({ data }) => {
  const storeName: string = data.storeName || 'EcomBaker';

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [deals, setDeals] = useState<WeeklyProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [flashItems, setFlashItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      apiService.fetchProducts(0, 16),
      apiService.fetchCategories(0, 20),
      apiService.fetchActiveWeeklyProducts(),
    ])
      .then(([prodsPage, catsPage, weeklyProds]) => {
        setProducts(prodsPage.content);
        setCategories(catsPage.content);
        setDeals(weeklyProds.filter(p => p.type === 'HEAVY_DISCOUNT' || p.type === 'FEATURED'));
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

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !activeCategory || p.category?.name === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="ta-root">
      {/* ── Top bar ── */}
      <div className="ta-topbar">
        <span>Free shipping on orders over $49</span>
        <span>|</span>
        <span>📞 1-800-ECOMBAKER</span>
      </div>

      {/* ── Header ── */}
      <header className="ta-header">
        <div className="ta-header-inner">
          <div className="ta-logo">{storeName}</div>

          <div className="ta-search">
            <select className="ta-search-cat">
              <option value="">All</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="ta-search-btn">🔍</button>
          </div>

          <div className="ta-header-actions">
            <button className="ta-action-btn">👤 Account</button>
            <button className="ta-action-btn">❤️ Wishlist</button>
            <button className="ta-cart-btn" onClick={() => setCartOpen(o => !o)}>
              🛒 Cart
              {totalCartItems > 0 && <span className="ta-cart-badge">{totalCartItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Category nav ── */}
      <nav className="ta-catnav">
        <button
          className={`ta-catnav-item${!activeCategory ? ' active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >All</button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`ta-catnav-item${activeCategory === c.name ? ' active' : ''}`}
            onClick={() => setActiveCategory(c.name)}
          >{c.name}</button>
        ))}
      </nav>

      {/* ── Cart drawer ── */}
      {cartOpen && (
        <div className="ta-cart-drawer">
          <div className="ta-cart-header">
            <h3>Your Cart ({totalCartItems})</h3>
            <button onClick={() => setCartOpen(false)}>✕</button>
          </div>
          {cart.length === 0
            ? <p className="ta-cart-empty">Your cart is empty.</p>
            : <>
                {cart.map(item => (
                  <div key={item.id} className="ta-cart-item">
                    <span>{item.name}</span>
                    <span>x{item.qty}</span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="ta-cart-total">Total: <strong>${totalCartPrice.toFixed(2)}</strong></div>
                <button className="ta-checkout-btn">Checkout</button>
              </>
          }
        </div>
      )}

      <main className="ta-main">
        {loading ? (
          <div className="ta-loading">Loading store…</div>
        ) : (
          <>
            {/* ── Deals banner ── */}
            {deals.length > 0 && (
              <section className="ta-deals">
                <div className="ta-section-header">
                  <h2>🔥 Today&apos;s Deals</h2>
                </div>
                <div className="ta-deals-scroll">
                  {deals.map(deal => (
                    <div key={deal.id} className="ta-deal-card">
                      {deal.productImageURI
                        ? <img src={deal.productImageURI} alt={deal.productName} />
                        : <div className="ta-img-placeholder" />}
                      {deal.discountPercentage > 0 && (
                        <span className="ta-deal-badge">-{deal.discountPercentage}%</span>
                      )}
                      <div className="ta-deal-body">
                        <p className="ta-deal-cat">{deal.categoryName}</p>
                        <h4>{deal.productName}</h4>
                        <span className="ta-deal-type">{deal.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Product grid ── */}
            <section className="ta-products">
              <div className="ta-section-header">
                <h2>{activeCategory ? activeCategory : 'All Products'}</h2>
                <span className="ta-count">{filteredProducts.length} items</span>
              </div>

              {filteredProducts.length === 0 ? (
                <p className="ta-empty">No products found.</p>
              ) : (
                <div className="ta-product-grid">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="ta-product-card">
                      {product.imageURI
                        ? <img src={product.imageURI} alt={product.name} />
                        : <div className="ta-img-placeholder" />}
                      <div className="ta-product-body">
                        <span className="ta-product-cat">{product.category?.name}</span>
                        <h4 title={product.name}>{product.name}</h4>
                        <p className="ta-product-desc">{product.description}</p>
                        <div className="ta-product-footer">
                          <span className="ta-product-price">${product.price?.toFixed(2)}</span>
                          <button
                            className={`ta-add-btn${flashItems.has(product.id) ? ' added' : ''}`}
                            onClick={() => addToCart(product)}
                            disabled={!product.isAvailable}
                          >
                            {flashItems.has(product.id) ? '✓ Added' : product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="ta-footer">
        <div className="ta-footer-inner">
          <div>
            <strong>{storeName}</strong>
            <p>Your trusted online marketplace</p>
          </div>
          <div>
            <p>Help &amp; Support</p>
            <p>Returns &amp; Refunds</p>
            <p>Shipping Info</p>
          </div>
          <div>
            <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            <p>Code: {data.storeCode}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TemplateA;
