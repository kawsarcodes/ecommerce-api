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
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');
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
      setUserRole('');
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
        const role = data.data.user.role || '';
        setUserRole(role);
        localStorage.setItem('token', newToken);
        if (role) localStorage.setItem('role', role);
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
    setUserRole('');
    setCategories([]);
    setProducts([]);
    setProdMeta(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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

    const baseClasses = "p-3 my-3 border rounded";
    const typeClasses = type === 'success'
      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
      : 'text-rose-800 bg-rose-50 border-rose-200';

    return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
  };

  return (
    <div className="max-w-6xl mx-auto p-5 font-sans">
      <h1 className="text-3xl font-bold text-black-800 border-b-2 border-black-500 pb-2.5">
        Express & Prisma REST API
      </h1>
      <p className="text-black-600 text-base mb-5">
        A testing interface to verify end to end backend integration.
        It demonstrates JWT authentication, Prisma ORM operations, and live PostgreSQL database queries.
      </p>

      {/* Authentication Status */}
      <section className={`p-4 rounded mb-5 border ${token ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <p className="mb-3">
          <strong>Status:</strong> {token ? 'Logged In' : 'Not Logged In'}
          {token && userEmail && (
            <>
              <br />
              <strong>User:</strong> {userName || userEmail}
              {userName && <span> ({userEmail})</span>}
              <br />
              <strong>Role:</strong> {userRole}
              {userRole === 'USER' && (
                <span className="ml-2.5 text-sm text-gray-600 italic">
                  Logged in as Regular User (Read-Only Actions)
                </span>
              )}
            </>
          )}
        </p>
        {token && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#dc3545] text-white border-none rounded cursor-pointer hover:bg-rose-600 transition-colors"
          >
            Logout
          </button>
        )}
      </section>

      <hr className="my-7 border-gray-300" />

      {/* Login and Registration*/}
      <section>
        <h2 className="text-2xl font-semibold mb-5">Authentication</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-5">
          {/* Login*/}
          <div className="p-5 rounded border border-gray-300">
            <h3 className="text-xl font-semibold mt-0 mb-4">Login</h3>
            <form onSubmit={handleLogin}>
              <div className="mb-2.5">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="p-2 w-full box-border border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-2.5">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="p-2 w-full box-border border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-2.5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('admin@test.dev');
                    setLoginPassword('admin123');
                  }}
                  className="flex-1 py-1.5 bg-gray-500 text-white border-none cursor-pointer text-sm rounded hover:bg-gray-600 transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('user@test.dev');
                    setLoginPassword('user123');
                  }}
                  className="flex-1 py-1.5 bg-gray-500 text-white border-none cursor-pointer text-sm rounded hover:bg-gray-600 transition-colors"
                >
                  User
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-[#28a745] text-white border-none rounded cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {renderMessage(loginMessage, loginMessageType)}
          </div>

          {/* Registration */}
          <div className="p-5 rounded border border-gray-300">
            <h3 className="text-xl font-semibold mt-0 mb-4">Register</h3>
            <form onSubmit={handleRegister}>
              <div className="mb-2.5">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="p-2 w-full box-border border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-2.5">
                <input
                  type="email"
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="p-2 w-full box-border border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-2.5">
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength="6"
                  className="p-2 w-full box-border border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
            {renderMessage(regMessage, regMessageType)}
          </div>
        </div>
      </section>

      <hr className="my-7 border-gray-300" />

      {/* Categories Section - visible when logged in */}
      {token && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          {userRole === 'ADMIN' && (
            <form onSubmit={handleAddCategory} className="mb-2.5 flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Category Name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
                className="p-2 w-48 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isCategoryLoading}
                className="px-4 py-2 bg-[#28a745] text-white border-none rounded cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCategoryLoading ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          )}

          {renderMessage(catMessage, catMessageType)}

          {isCategoryLoading && !catMessage && <p className="text-gray-600">Loading categories...</p>}

          <div className="overflow-x-auto mt-2.5">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border border-gray-300">ID</th>
                  <th className="p-2 text-left border border-gray-300">Name</th>
                  <th className="p-2 text-left border border-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-2 text-center border border-gray-300">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="p-2 border border-gray-300">{cat.id}</td>
                      <td className="p-2 border border-gray-300">{cat.name}</td>
                      <td className="p-2 border border-gray-300">
                        {userRole === 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={isCategoryLoading}
                            className="px-3 py-1 bg-[#dc3545] text-white border-none rounded cursor-pointer hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <hr className="my-7 border-gray-300" />

      {/* Products Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Products</h2>

        <form onSubmit={handleApplyFilters} className="bg-gray-100 p-4 rounded mb-4">
          <div className="mb-2.5">
            <label className="font-medium">
              Search:
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                className="ml-2.5 p-2 w-48 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
          <div className="mb-2.5">
            <label className="font-medium">
              Category ID:
              <input
                type="text"
                value={prodCategoryId}
                onChange={(e) => setProdCategoryId(e.target.value)}
                className="ml-2.5 p-2 w-48 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
          <div className="mb-2.5">
            <label className="font-medium">
              Min Price:
              <input
                type="number"
                value={prodMinPrice}
                onChange={(e) => setProdMinPrice(e.target.value)}
                className="ml-2.5 p-2 w-36 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="ml-5 font-medium">
              Max Price:
              <input
                type="number"
                value={prodMaxPrice}
                onChange={(e) => setProdMaxPrice(e.target.value)}
                className="ml-2.5 p-2 w-36 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
          <div className="mb-2.5">
            <label className="font-medium">
              Sort By:
              <select
                value={prodSortBy}
                onChange={(e) => setProdSortBy(e.target.value)}
                className="ml-2.5 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Created At</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </label>
            <label className="ml-5 font-medium">
              Sort Order:
              <select
                value={prodSortOrder}
                onChange={(e) => setProdSortOrder(e.target.value)}
                className="ml-2.5 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">DESC</option>
                <option value="asc">ASC</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={isProductsLoading}
            className="px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProductsLoading ? 'Loading...' : 'Apply Filters'}
          </button>
        </form>

        {renderMessage(prodMessage, prodMessageType)}

        {isProductsLoading && !prodMessage && <p className="text-gray-600">Loading products...</p>}

        <div className="overflow-x-auto mt-2.5">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left border border-gray-300">ID</th>
                <th className="p-2 text-left border border-gray-300">Name</th>
                <th className="p-2 text-left border border-gray-300">Price</th>
                <th className="p-2 text-left border border-gray-300">Category ID</th>
                <th className="p-2 text-left border border-gray-300">Created At</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-2 text-center border border-gray-300">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 border border-gray-300">{p.id}</td>
                    <td className="p-2 border border-gray-300">{p.name}</td>
                    <td className="p-2 border border-gray-300">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="p-2 border border-gray-300">{p.categoryId || 'N/A'}</td>
                    <td className="p-2 border border-gray-300">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {prodMeta && products.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-between items-center p-2.5 bg-gray-100 rounded">
            <p className="m-0">
              <strong>Total Items:</strong> {prodMeta.total} |
              <strong> Page:</strong> {prodMeta.page} of {prodMeta.totalPages} |
              <strong> Limit:</strong> {prodMeta.limit}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={prodMeta.page <= 1 || isProductsLoading}
                className="px-3 py-1.5 bg-gray-500 text-white border-none rounded cursor-pointer hover:bg-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={prodMeta.page >= prodMeta.totalPages || isProductsLoading}
                className="px-3 py-1.5 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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