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

  // Initial fetch if token exists
  useEffect(() => {
    if (token) {
      fetchCategories();
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
    </div>
  );
}

export default App;
