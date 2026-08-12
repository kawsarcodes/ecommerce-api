import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userEmail, setUserEmail] = useState('');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMessage, setRegMessage] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  // Categories State
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [catMessage, setCatMessage] = useState('');

  // Products State
  const [products, setProducts] = useState([]);
  const [prodMessage, setProdMessage] = useState('');

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

  // Initial fetch if token exists
  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchProducts(1);
    }
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setRegMessage('Registration successful! You can now log in.');
      } else {
        setRegMessage(`Registration failed: ${data.message}`);
      }
    } catch (err) {
      setRegMessage(`Error: ${err.message}`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
        setUserEmail(data.data.user.email);
        localStorage.setItem('token', data.data.token);
        setLoginMessage('Login successful!');
      } else {
        setLoginMessage(`Login failed: ${data.message}`);
      }
    } catch (err) {
      setLoginMessage(`Error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUserEmail('');
    setCategories([]);
    setProducts([]);
    setProdMeta(null);
    localStorage.removeItem('token');
    setLoginMessage('Logged out.');
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      setCatMessage(`Error fetching categories: ${err.message}`);
    }
  };

  const fetchProducts = async (pageToFetch = prodPage) => {
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
        setProducts(data.data);
        setProdMeta(data.meta);
        setProdPage(data.meta.page);
        setProdMessage('Products fetched successfully.');
      } else {
        setProdMessage(`Error fetching products: ${data.message}`);
      }
    } catch (err) {
      setProdMessage(`Error: ${err.message}`);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchProducts(1); // Reset to page 1 on new filters
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: catName }),
      });
      const data = await res.json();
      if (data.success) {
        setCatMessage('Category added successfully.');
        setCatName('');
        fetchCategories();
      } else {
        setCatMessage(`Failed to add: ${data.message}`);
      }
    } catch (err) {
      setCatMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCatMessage('Category deleted successfully.');
        fetchCategories();
      } else {
        setCatMessage(`Failed to delete: ${data.message}`);
      }
    } catch (err) {
      setCatMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h1>Express & Prisma REST API Test Console</h1>
      <p>
        A testing interface to verify end to end backend integration.
        It demonstrates JWT authentication, Prisma ORM operations, and live PostgreSQL database queries.
      </p>

      <section>
        <h2>Authentication Status</h2>
        <p>
          {token ? `Logged in${userEmail ? ` as: ${userEmail}` : ' (Token Present)'}` : 'Not logged in'}
        </p>
        {token && <button onClick={handleLogout}>Logout</button>}
      </section>

      <hr />

      <section>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
          <br />
          <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
          <br />
          <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
          <br />
          <button type="submit">Register</button>
        </form>
        <p>{regMessage}</p>
      </section>

      <hr />

      <section>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
          <br />
          <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
          <br />
          <button type="submit">Login</button>
        </form>
        <p>{loginMessage}</p>
      </section>

      <hr />

      {token && (
        <section>
          <h2>Categories</h2>
          <form onSubmit={handleAddCategory}>
            <input type="text" placeholder="Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} required />
            <button type="submit">Add Category</button>
          </form>
          <p>{catMessage}</p>

          <table border="1">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>
                    <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <hr />

      <section>
        <h2>Products</h2>

        <form onSubmit={handleApplyFilters}>
          <label>Search: <input type="text" value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} /></label><br />
          <label>Category ID: <input type="text" value={prodCategoryId} onChange={(e) => setProdCategoryId(e.target.value)} /></label><br />
          <label>Min Price: <input type="number" value={prodMinPrice} onChange={(e) => setProdMinPrice(e.target.value)} /></label><br />
          <label>Max Price: <input type="number" value={prodMaxPrice} onChange={(e) => setProdMaxPrice(e.target.value)} /></label><br />
          <label>Sort By:
            <select value={prodSortBy} onChange={(e) => setProdSortBy(e.target.value)}>
              <option value="createdAt">Created At</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </label><br />
          <label>Sort Order:
            <select value={prodSortOrder} onChange={(e) => setProdSortOrder(e.target.value)}>
              <option value="desc">DESC</option>
              <option value="asc">ASC</option>
            </select>
          </label><br />
          <button type="submit">Apply Filters</button>
        </form>

        <p>{prodMessage}</p>

        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category ID</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.categoryId}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {prodMeta && (
          <div style={{ marginTop: '10px' }}>
            <p>
              Total Items: {prodMeta.total} | Page {prodMeta.page} of {prodMeta.totalPages} | Limit: {prodMeta.limit}
            </p>
            <button onClick={handlePrevPage} disabled={prodMeta.page <= 1}>Previous</button>
            <button onClick={handleNextPage} disabled={prodMeta.page >= prodMeta.totalPages}>Next</button>
          </div>
        )}
      </section>

    </div>
  );
}

export default App;
