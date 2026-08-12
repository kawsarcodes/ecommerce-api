import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getErrorMessage = (data) => {
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.errors)) return JSON.stringify(data.errors);
  if (data.error) return data.error;
  return 'An unexpected error occurred';
};

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMessage, setRegMessage] = useState('');
  const [regMessageType, setRegMessageType] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [loginMessageType, setLoginMessageType] = useState('');

  // Categories State
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [catMessage, setCatMessage] = useState('');
  const [catMessageType, setCatMessageType] = useState('');
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [prodMessage, setProdMessage] = useState('');
  const [prodMessageType, setProdMessageType] = useState('');
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // Product Query State
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodMinPrice, setProdMinPrice] = useState('');
  const [prodMaxPrice, setProdMaxPrice] = useState('');
  const [prodSortBy, setProdSortBy] = useState('createdAt');
  const [prodSortOrder, setProdSortOrder] = useState('desc');
  const [prodPage, setProdPage] = useState(1);
  const [prodLimit, setProdLimit] = useState(10);
  const [prodMeta, setProdMeta] = useState(null);

  // Clear messages helper
  const clearMessages = () => {
    setRegMessage('');
    setLoginMessage('');
    setCatMessage('');
    setProdMessage('');
  };

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    if (!token) return;

    setIsCategoryLoading(true);
    setCatMessage('');

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();

      if (data.success) {
        setCategories(data.data || []);
        setCatMessageType('success');
        setCatMessage('Categories loaded successfully.');
      } else {
        setCatMessageType('error');
        setCatMessage(`Error fetching categories: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setCatMessageType('error');
      setCatMessage(`Error fetching categories: ${err.message}`);
    } finally {
      setIsCategoryLoading(false);
    }
  }, [token]);

  const fetchProducts = useCallback(async (pageToFetch = 1) => {
    setIsProductsLoading(true);
    setProdMessage('');

    try {
      const params = new URLSearchParams();
      if (prodSearch) params.append('search', prodSearch);
      if (prodCategoryId) params.append('categoryId', prodCategoryId);
      if (prodMinPrice) params.append('minPrice', prodMinPrice);
      if (prodMaxPrice) params.append('maxPrice', prodMaxPrice);
      params.append('sortBy', prodSortBy);
      params.append('sortOrder', prodSortOrder);
      params.append('page', pageToFetch);
      params.append('limit', prodLimit);

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data || []);
        setProdMeta(data.meta);
        setProdPage(data.meta?.page || 1);
        setProdMessageType('success');
        setProdMessage(`Products fetched successfully. Found ${data.meta?.total || 0} items.`);
      } else {
        setProdMessageType('error');
        setProdMessage(`Error fetching products: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setProdMessageType('error');
      setProdMessage(`Error: ${err.message}`);
    } finally {
      setIsProductsLoading(false);
    }
  }, [prodSearch, prodCategoryId, prodMinPrice, prodMaxPrice, prodSortBy, prodSortOrder, prodLimit]);

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchProducts(1);
    } else {
      setCategories([]);
      setProducts([]);
      setProdMeta(null);
      setUserEmail('');
      setUserName('');
    }
  }, [token, fetchCategories, fetchProducts]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setRegMessage('');

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword
        }),
      });

      const data = await res.json();

      if (data.success) {
        setRegMessageType('success');
        setRegMessage('Registration successful! You can now log in.');
        setRegName('');
        setRegEmail('');
        setRegPassword('');
      } else {
        setRegMessageType('error');
        setRegMessage(`Registration failed: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setRegMessageType('error');
      setRegMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginMessage('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword
        }),
      });

      const data = await res.json();

      if (data.success) {
        const newToken = data.data.token;
        setToken(newToken);
        setUserEmail(data.data.user.email);
        setUserName(data.data.user.name || '');
        localStorage.setItem('token', newToken);
        setLoginMessageType('success');
        setLoginMessage('Login successful!');
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginMessageType('error');
        setLoginMessage(`Login failed: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setLoginMessageType('error');
      setLoginMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUserEmail('');
    setUserName('');
    setCategories([]);
    setProducts([]);
    setProdMeta(null);
    localStorage.removeItem('token');
    setLoginMessageType('success');
    setLoginMessage('Logged out successfully.');
    clearMessages();
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatMessageType('error');
      setCatMessage('Category name is required');
      return;
    }

    setIsCategoryLoading(true);
    setCatMessage('');

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: catName.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setCatMessageType('success');
        setCatMessage('Category added successfully.');
        setCatName('');
        await fetchCategories();
      } else {
        setCatMessageType('error');
        setCatMessage(`Failed to add category: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setCatMessageType('error');
      setCatMessage(`Error: ${err.message}`);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setIsCategoryLoading(true);
    setCatMessage('');

    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();

      if (data.success) {
        setCatMessageType('success');
        setCatMessage('Category deleted successfully.');
        await fetchCategories();
      } else {
        setCatMessageType('error');
        setCatMessage(`Failed to delete category: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setCatMessageType('error');
      setCatMessage(`Error: ${err.message}`);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleNextPage = () => {
    if (prodMeta && prodPage < prodMeta.totalPages) {
      fetchProducts(prodPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (prodPage > 1) {
      fetchProducts(prodPage - 1);
    }
  };

  const renderMessage = (message, type) => {
    if (!message) return null;

    const style = {
      padding: '10px',
      borderRadius: '4px',
      margin: '10px 0',
      color: type === 'success' ? '#155724' : '#721c24',
      backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
      border: `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
    };

    return <div style={style}>{message}</div>;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
        Express & Prisma REST API Test Console
      </h1>
      <p style={{ color: '#666', fontSize: '1.1em' }}>
        A testing interface to verify end to end backend integration.
        It demonstrates JWT authentication, Prisma ORM operations, and live PostgreSQL database queries.
      </p>

      {/* Authentication Status */}
      <section style={{
        background: token ? '#d4edda' : '#f8d7da',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h2>Authentication Status</h2>
        <p>
          <strong>Status:</strong> {token ? 'Logged In' : 'Not Logged In'}
          {token && userEmail && (
            <>
              <br />
              <strong>User:</strong> {userName || userEmail}
              {userName && <span> ({userEmail})</span>}
            </>
          )}
        </p>
        {token && (
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        )}
      </section>

      <hr style={{ margin: '30px 0' }} />

      {/* Registration Section */}
      <section>
        <h2>Register</h2>
        <form onSubmit={handleRegister} style={{ marginBottom: '10px' }}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
              style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
              style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              minLength="6"
              style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {renderMessage(regMessage, regMessageType)}
      </section>

      <hr style={{ margin: '30px 0' }} />

      {/* Login Section */}
      <section>
        <h2>Login</h2>
        <form onSubmit={handleLogin} style={{ marginBottom: '10px' }}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {renderMessage(loginMessage, loginMessageType)}
      </section>

      <hr style={{ margin: '30px 0' }} />

      {/* Categories Section - visible when logged in */}
      {token && (
        <section>
          <h2>Categories</h2>
          <form onSubmit={handleAddCategory} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Category Name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <button
              type="submit"
              disabled={isCategoryLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isCategoryLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isCategoryLoading ? 'Adding...' : 'Add Category'}
            </button>
          </form>

          {renderMessage(catMessage, catMessageType)}

          {isCategoryLoading && !catMessage && <p>Loading categories...</p>}

          <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '8px', textAlign: 'center' }}>
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ padding: '8px' }}>{cat.id}</td>
                    <td style={{ padding: '8px' }}>{cat.name}</td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={isCategoryLoading}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isCategoryLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}

      <hr style={{ margin: '30px 0' }} />

      {/* Products Section */}
      <section>
        <h2>Products</h2>

        <form onSubmit={handleApplyFilters} style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Search:
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                style={{ marginLeft: '10px', padding: '8px', width: '200px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Category ID:
              <input
                type="text"
                value={prodCategoryId}
                onChange={(e) => setProdCategoryId(e.target.value)}
                style={{ marginLeft: '10px', padding: '8px', width: '200px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Min Price:
              <input
                type="number"
                value={prodMinPrice}
                onChange={(e) => setProdMinPrice(e.target.value)}
                style={{ marginLeft: '10px', padding: '8px', width: '150px' }}
              />
            </label>
            <label style={{ marginLeft: '20px' }}>
              Max Price:
              <input
                type="number"
                value={prodMaxPrice}
                onChange={(e) => setProdMaxPrice(e.target.value)}
                style={{ marginLeft: '10px', padding: '8px', width: '150px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Sort By:
              <select
                value={prodSortBy}
                onChange={(e) => setProdSortBy(e.target.value)}
                style={{ marginLeft: '10px', padding: '8px' }}
              >
                <option value="createdAt">Created At</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </label>
            <label style={{ marginLeft: '20px' }}>
              Sort Order:
              <select
                value={prodSortOrder}
                onChange={(e) => setProdSortOrder(e.target.value)}
                style={{ marginLeft: '10px', padding: '8px' }}
              >
                <option value="desc">DESC</option>
                <option value="asc">ASC</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={isProductsLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isProductsLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isProductsLoading ? 'Loading...' : 'Apply Filters'}
          </button>
        </form>

        {renderMessage(prodMessage, prodMessageType)}

        {isProductsLoading && !prodMessage && <p>Loading products...</p>}

        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Category ID</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '8px', textAlign: 'center' }}>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: '8px' }}>{p.id}</td>
                  <td style={{ padding: '8px' }}>{p.name}</td>
                  <td style={{ padding: '8px' }}>${parseFloat(p.price).toFixed(2)}</td>
                  <td style={{ padding: '8px' }}>{p.categoryId || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {prodMeta && products.length > 0 && (
          <div style={{
            marginTop: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <p style={{ margin: 0 }}>
              <strong>Total Items:</strong> {prodMeta.total} |
              <strong> Page:</strong> {prodMeta.page} of {prodMeta.totalPages} |
              <strong> Limit:</strong> {prodMeta.limit}
            </p>
            <div>
              <button
                onClick={handlePrevPage}
                disabled={prodMeta.page <= 1 || isProductsLoading}
                style={{
                  padding: '6px 12px',
                  marginRight: '10px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (prodMeta.page <= 1 || isProductsLoading) ? 'not-allowed' : 'pointer',
                  opacity: (prodMeta.page <= 1 || isProductsLoading) ? 0.6 : 1
                }}
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={prodMeta.page >= prodMeta.totalPages || isProductsLoading}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (prodMeta.page >= prodMeta.totalPages || isProductsLoading) ? 'not-allowed' : 'pointer',
                  opacity: (prodMeta.page >= prodMeta.totalPages || isProductsLoading) ? 0.6 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;