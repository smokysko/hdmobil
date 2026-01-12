import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState([
    {
      id: '1',
      sku: 'HDMI-001',
      name: 'HDMI 2.1 kabel 2m',
      price: 19.99,
      stock: 150,
      category: 'Kabely',
      status: 'active',
      image: '📱',
    },
    {
      id: '2',
      sku: 'USB-C-001',
      name: 'USB-C nabíjecí kabel',
      price: 14.99,
      stock: 0,
      category: 'Kabely',
      status: 'inactive',
      image: '🔌',
    },
    {
      id: '3',
      sku: 'SCREEN-001',
      name: 'Ochranné sklo na displej',
      price: 9.99,
      stock: 500,
      category: 'Ochrana',
      status: 'active',
      image: '🛡️',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || p.status === filterStatus)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Správa produktů</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Nový produkt
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hledat</label>
              <input
                type="text"
                placeholder="Název nebo SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stav</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny</option>
                <option value="active">Aktivní</option>
                <option value="inactive">Neaktivní</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Všechny kategorie</option>
                <option>Kabely</option>
                <option>Ochrana</option>
                <option>Příslušenství</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Produkt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cena</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sklad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Kategorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stav</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{product.image}</span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.price.toFixed(2)} EUR</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {product.stock} ks
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status === 'active' ? 'Aktivní' : 'Neaktivní'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 font-medium">Upravit</button>
                        <button className="text-red-600 hover:text-red-700 font-medium">Smazat</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">← Předchozí</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">2</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Další →</button>
        </div>
      </main>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Nový produkt</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Název</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cena (EUR)</label>
                  <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sklad</label>
                  <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Kabely</option>
                  <option>Ochrana</option>
                  <option>Příslušenství</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Zrušit
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Vytvořit produkt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
