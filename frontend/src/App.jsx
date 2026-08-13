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

  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [productDetail, setProductDetail] = useState(null);
  const [isProductDetailLoading, setIsProductDetailLoading] = useState(false);

  // Review States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewMessageType, setReviewMessageType] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  // Product Management States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: ''
  });
  const [productFormMessage, setProductFormMessage] = useState('');
  const [productFormMessageType, setProductFormMessageType] = useState('');
  const [isProductFormSubmitting, setIsProductFormSubmitting] = useState(false);

  // Clear messages helper
  const clearMessages = () => {
    setRegMessage('');
    setLoginMessage('');
    setCatMessage('');
    setProdMessage('');
    setReviewMessage('');
    setProductFormMessage('');
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

  // Fetch Product Detail
  const fetchProductDetail = async (productId) => {
    setIsProductDetailLoading(true);
    setReviewMessage('');
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (data.success) {
        setProductDetail(data.data);
        setShowProductDetail(true);
      } else {
        console.error('Failed to fetch product:', data.message);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setIsProductDetailLoading(false);
    }
  };

  // Add Review
  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!token) {
      setReviewMessageType('error');
      setReviewMessage('Please login to add a review');
      return;
    }

    setIsReviewSubmitting(true);
    setReviewMessage('');

    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productDetail.id,
          rating: parseInt(reviewRating),
          comment: reviewComment.trim()
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReviewMessageType('success');
        setReviewMessage('Review added successfully!');
        setReviewComment('');
        setReviewRating(5);
        // Refresh product details to show new review
        await fetchProductDetail(productDetail.id);
      } else {
        setReviewMessageType('error');
        setReviewMessage(`Failed to add review: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setReviewMessageType('error');
      setReviewMessage(`Error: ${err.message}`);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();

      if (data.success) {
        setReviewMessageType('success');
        setReviewMessage('Review deleted successfully!');
        await fetchProductDetail(productDetail.id);
      } else {
        setReviewMessageType('error');
        setReviewMessage(`Failed to delete review: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setReviewMessageType('error');
      setReviewMessage(`Error: ${err.message}`);
    }
  };

  // Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsProductFormSubmitting(true);
    setProductFormMessage('');

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProduct.name.trim(),
          description: newProduct.description.trim(),
          price: parseFloat(newProduct.price),
          categoryId: newProduct.categoryId
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProductFormMessageType('success');
        setProductFormMessage('Product created successfully!');
        setNewProduct({ name: '', description: '', price: '', categoryId: '' });
        setShowAddProduct(false);
        await fetchProducts(prodPage);
      } else {
        setProductFormMessageType('error');
        setProductFormMessage(`Failed to create product: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setProductFormMessageType('error');
      setProductFormMessage(`Error: ${err.message}`);
    } finally {
      setIsProductFormSubmitting(false);
    }
  };

  // Update Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsProductFormSubmitting(true);
    setProductFormMessage('');

    try {
      const res = await fetch(`${API_BASE}/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProduct.name.trim(),
          description: newProduct.description.trim(),
          price: parseFloat(newProduct.price),
          categoryId: newProduct.categoryId
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProductFormMessageType('success');
        setProductFormMessage('Product updated successfully!');
        setShowEditProduct(false);
        setEditingProduct(null);
        setNewProduct({ name: '', description: '', price: '', categoryId: '' });
        await fetchProducts(prodPage);
      } else {
        setProductFormMessageType('error');
        setProductFormMessage(`Failed to update product: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setProductFormMessageType('error');
      setProductFormMessage(`Error: ${err.message}`);
    } finally {
      setIsProductFormSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();

      if (data.success) {
        setProdMessageType('success');
        setProdMessage('Product deleted successfully!');
        await fetchProducts(prodPage);
      } else {
        setProdMessageType('error');
        setProdMessage(`Failed to delete product: ${getErrorMessage(data)}`);
      }
    } catch (err) {
      setProdMessageType('error');
      setProdMessage(`Error: ${err.message}`);
    }
  };

  // Open Edit Product Modal
  const openEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      categoryId: product.categoryId || ''
    });
    setShowEditProduct(true);
  };

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
    <div className="max-w-7xl mx-auto p-5 font-sans">
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
                {isCategoryLoading ? 'Adding...' : '+ Add Category'}
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
                            className="px-2.5 py-1 text-xs rounded-[3px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Products</h2>
          {userRole === 'ADMIN' && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 bg-[#28a745] text-white rounded hover:bg-emerald-600 transition-colors"
            >
              + Add New Product
            </button>
          )}
        </div>

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
          <p className="text-[16px] text-black-500 my-2">* Click on product name to view product details</p>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left border border-gray-300">ID</th>
                <th className="p-2 text-left border border-gray-300">Name</th>
                <th className="p-2 text-left border border-gray-300">Price</th>
                <th className="p-2 text-left border border-gray-300">Category ID</th>
                <th className="p-2 text-left border border-gray-300">Created At</th>
                {userRole === 'ADMIN' && (
                  <th className="p-2 text-left border border-gray-300">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 6 : 5} className="p-2 text-center border border-gray-300">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-2 border border-gray-300">{p.id}</td>
                    <td
                      className="p-2 border border-gray-300 cursor-pointer text-blue-600 hover:underline"
                      onClick={() => fetchProductDetail(p.id)}
                    >
                      {p.name}
                    </td>
                    <td className="p-2 border border-gray-300">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="p-2 border border-gray-300">{p.categoryId || 'N/A'}</td>
                    <td className="p-2 border border-gray-300">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    {userRole === 'ADMIN' && (
                      <td className="p-2 border border-gray-300">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditProduct(p);
                            }}
                            className="px-2.5 py-1 text-xs rounded-[3px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(p.id);
                            }}
                            className="px-2.5 py-1 text-xs rounded-[3px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
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

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setProductFormMessage('');
                  setNewProduct({ name: '', description: '', price: '', categoryId: '' });
                }}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Category</label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {renderMessage(productFormMessage, productFormMessageType)}
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={isProductFormSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isProductFormSubmitting ? 'Creating...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false);
                    setProductFormMessage('');
                    setNewProduct({ name: '', description: '', price: '', categoryId: '' });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3px] max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Edit Product</h2>
              <button
                onClick={() => {
                  setShowEditProduct(false);
                  setEditingProduct(null);
                  setProductFormMessage('');
                  setNewProduct({ name: '', description: '', price: '', categoryId: '' });
                }}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateProduct}>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Category</label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {renderMessage(productFormMessage, productFormMessageType)}
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={isProductFormSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-[3px] hover:bg-blue-600 disabled:opacity-50"
                >
                  {isProductFormSubmitting ? 'Updating...' : 'Update Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProduct(false);
                    setEditingProduct(null);
                    setProductFormMessage('');
                    setNewProduct({ name: '', description: '', price: '', categoryId: '' });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-[3px] hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Loading */}
      {isProductDetailLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[3px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-black-600">Loading product details...</p>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetail && productDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3px] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{productDetail.name}</h2>
              <button
                onClick={() => {
                  setShowProductDetail(false);
                  setProductDetail(null);
                  setReviewMessage('');
                }}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-black-600 mb-2">
                  <strong>Price:</strong> ${parseFloat(productDetail.price).toFixed(2)}
                </p>
                <p className="text-black-600 mb-2">
                  <strong>Category:</strong> {productDetail.category?.name || 'N/A'}
                </p>
                <p className="text-black-600 mb-2">
                  <strong>Added by:</strong> {productDetail.user?.name || 'Unknown'}
                </p>
                <p className="text-black-600 mb-2">
                  <strong>Status:</strong> {productDetail.status || 'ACTIVE'}
                </p>
                <p className="text-black-600">
                  <strong>Created:</strong> {new Date(productDetail.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-black-600 font-semibold mb-2">Description</h3>
                <p className="text-black-600">
                  {productDetail.description || 'No description available'}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t pt-4">
              <h3 className="text-black-600 font-semibold mb-4">
                Reviews ({productDetail.reviews?.length || 0})
              </h3>

              {/* Add Review Form - only show if logged in */}
              {token && (
                <form onSubmit={handleAddReview} className="mb-6 bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-3">Add Your Review</h4>
                  <div className="mb-3">
                    <label className="block mb-1 font-medium">Rating:</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1 font-medium">Comment:</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Write your review here..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isReviewSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  {renderMessage(reviewMessage, reviewMessageType)}
                </form>
              )}

              {/* Reviews List */}
              {productDetail.reviews?.length === 0 ? (
                <p className="text-black-600">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {productDetail.reviews?.map((review) => (
                    <div key={review.id} className="border rounded p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{review.user?.name || review.user?.email || 'Anonymous'}</span>
                            <span className="text-yellow-500">Rating: {review.rating}/5</span>
                          </div>
                          <p className="text-gray-700 mt-2">{review.comment}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(review.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {/* Delete button - only for review owner */}
                        {token && review.userId === userEmail && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;