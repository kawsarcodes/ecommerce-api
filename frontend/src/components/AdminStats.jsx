import React, { useState, useEffect } from 'react';

const AdminStats = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stats/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="border border-gray-300 rounded p-4">
        <p className="text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded">
        <p><strong>Error loading stats:</strong> {error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Product Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border border-gray-300 rounded p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="border border-gray-300 rounded p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Total Categories</p>
          <p className="text-2xl font-bold">{stats.totalCategories}</p>
        </div>

        <div className="border border-gray-300 rounded p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Average Price</p>
          <p className="text-2xl font-bold">${stats.averagePrice.toFixed(2)}</p>
        </div>

        <div className="border border-gray-300 rounded p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Price Range</p>
          <p className="text-xl font-bold">
            ${stats.minPrice.toFixed(2)} - ${stats.maxPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Products by Category</h3>
        <div className="border border-gray-300 rounded p-4">
          <div className="space-y-3">
            {stats.productCountByCategory.map((category) => (
              <div key={category.categoryId}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{category.categoryName}</span>
                  <span className="text-sm text-gray-600">{category.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded"
                    style={{ 
                      width: `${Math.max((category.count / stats.totalProducts) * 100, 2)}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;