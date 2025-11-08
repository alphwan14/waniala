'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/utils/storage';
import { calculateRentalTotals, formatCurrency, formatDate } from '@/utils/calculations';
import { RentalRecord } from '@/types';

export default function RentalsPage() {
  const [records, setRecords] = useState<RentalRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const [formData, setFormData] = useState({
    roomNumber: '',
    tenantName: '',
    rentAmount: '',
    datePaid: new Date().toISOString().split('T')[0],
    paymentStatus: 'Pending' as 'Paid' | 'Pending',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = storage.getRentalRecords();
    allRecords.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    setRecords(allRecords);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: RentalRecord = {
      id: editingId || Date.now().toString(),
      roomNumber: formData.roomNumber,
      tenantName: formData.tenantName,
      rentAmount: parseFloat(formData.rentAmount) || 0,
      datePaid: formData.datePaid,
      paymentStatus: formData.paymentStatus,
    };

    storage.saveRentalRecord(record);
    resetForm();
    loadRecords();
    
    const successEvent = new CustomEvent('showToast', {
      detail: { 
        message: editingId ? 'Record updated successfully!' : 'Record added successfully!', 
        type: 'success' 
      }
    });
    window.dispatchEvent(successEvent);
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      tenantName: '',
      rentAmount: '',
      datePaid: new Date().toISOString().split('T')[0],
      paymentStatus: 'Pending',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (record: RentalRecord) => {
    setFormData({
      roomNumber: record.roomNumber,
      tenantName: record.tenantName,
      rentAmount: record.rentAmount.toString(),
      datePaid: record.datePaid,
      paymentStatus: record.paymentStatus,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this rental record?')) {
      storage.deleteRentalRecord(id);
      loadRecords();
      
      const successEvent = new CustomEvent('showToast', {
        detail: { message: 'Record deleted successfully!', type: 'success' }
      });
      window.dispatchEvent(successEvent);
    }
  };

  const handleToggleStatus = (record: RentalRecord) => {
    const updatedRecord: RentalRecord = {
      ...record,
      paymentStatus: record.paymentStatus === 'Paid' ? 'Pending' : 'Paid',
      datePaid: record.paymentStatus === 'Pending' ? new Date().toISOString().split('T')[0] : record.datePaid,
    };
    storage.saveRentalRecord(updatedRecord);
    loadRecords();
    
    const status = updatedRecord.paymentStatus === 'Paid' ? 'marked as paid' : 'marked as pending';
    const successEvent = new CustomEvent('showToast', {
      detail: { message: `Record ${status}!`, type: 'success' }
    });
    window.dispatchEvent(successEvent);
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'paid' && record.paymentStatus === 'Paid') ||
      (statusFilter === 'pending' && record.paymentStatus === 'Pending');
    
    return matchesSearch && matchesStatus;
  });

  const totals = calculateRentalTotals(records);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl mb-4">
          <span className="text-3xl">🏠</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
          Rental Tracker
        </h1>
        <p className="text-gray-600 text-lg">Manage your rental properties and payments</p>
        <div className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 h-1 w-24 mx-auto rounded-full"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card border-l-4 border-l-success-500 group hover:border-l-success-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Expected</p>
              <p className="text-2xl font-bold text-success-700 group-hover:scale-105 transition-transform duration-200">
                {formatCurrency(totals.totalExpected)}
              </p>
            </div>
            <div className="text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              💰
            </div>
          </div>
        </div>

        <div className="stat-card border-l-4 border-l-primary-500 group hover:border-l-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-primary-700 group-hover:scale-105 transition-transform duration-200">
                {formatCurrency(totals.totalCollected)}
              </p>
            </div>
            <div className="text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              ✅
            </div>
          </div>
        </div>

        <div className="stat-card border-l-4 border-l-warning-500 group hover:border-l-warning-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-warning-700 group-hover:scale-105 transition-transform duration-200">
                {formatCurrency(totals.pending)}
              </p>
            </div>
            <div className="text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              ⏳
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">🔍 Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              placeholder="Search by room number or tenant name..."
            />
          </div>
          <div className="sm:w-48">
            <label className="label">📊 Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'pending')}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary-300 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-3 text-white text-2xl shadow-lg">
              {editingId ? '✏️' : '➕'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 ml-4">
              {editingId ? 'Edit Rental Record' : 'Add New Rental'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">🚪 Room Number</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Room 1, Studio A..."
                  required
                />
              </div>

              <div>
                <label className="label">👤 Tenant Name</label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  className="input-field"
                  placeholder="Enter tenant name"
                  required
                />
              </div>

              <div>
                <label className="label">💰 Rent Amount (Ksh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="label">📅 Date Paid</label>
                <input
                  type="date"
                  value={formData.datePaid}
                  onChange={(e) => setFormData({ ...formData, datePaid: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">📊 Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'Paid' | 'Pending' })}
                  className="input-field"
                  required
                >
                  <option value="Pending">⏳ Pending</option>
                  <option value="Paid">✅ Paid</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button type="submit" className="btn-success flex-1 flex items-center justify-center space-x-2">
                <span>{editingId ? '💾' : '➕'}</span>
                <span>{editingId ? 'Update Record' : 'Add Record'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <span>❌</span>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-lg px-8 py-4 flex items-center space-x-3"
          >
            <span>➕</span>
            <span>Add New Rental</span>
          </button>
        </div>
      )}

      {/* Records Table */}
      <div className="card group hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white text-2xl shadow-lg">
              📋
            </div>
            <h2 className="text-2xl font-bold text-gray-800 ml-4">Rental Records</h2>
          </div>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredRecords.length} of {records.length} records
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-lg text-gray-500 mb-2">
              {records.length === 0 ? 'No rental records yet' : 'No records match your search'}
            </p>
            <p className="text-gray-400">
              {records.length === 0 ? 'Add your first rental to get started!' : 'Try adjusting your search or filter'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Room Number</th>
                    <th className="table-header-cell">Tenant Name</th>
                    <th className="table-header-cell">Rent Amount</th>
                    <th className="table-header-cell">Date Paid</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="table-row">
                      <td className="table-cell font-semibold text-gray-900">
                        {record.roomNumber}
                      </td>
                      <td className="table-cell text-gray-700">
                        {record.tenantName}
                      </td>
                      <td className="table-cell font-semibold text-primary-600">
                        {formatCurrency(record.rentAmount)}
                      </td>
                      <td className="table-cell text-gray-700">
                        {formatDate(record.datePaid)}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleToggleStatus(record)}
                          className={`badge ${
                            record.paymentStatus === 'Paid'
                              ? 'badge-success'
                              : 'badge-warning'
                          } hover:scale-105 transition-transform duration-200 cursor-pointer`}
                        >
                          {record.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                        </button>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center space-x-1"
                          >
                            <span>✏️</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="bg-danger-100 hover:bg-danger-200 text-danger-700 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center space-x-1"
                          >
                            <span>🗑️</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{record.roomNumber}</h3>
                      <p className="text-gray-600">{record.tenantName}</p>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(record)}
                      className={`badge ${
                        record.paymentStatus === 'Paid'
                          ? 'badge-success'
                          : 'badge-warning'
                      } hover:scale-105 transition-transform duration-200 cursor-pointer`}
                    >
                      {record.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="bg-primary-50 p-3 rounded-xl">
                      <p className="text-primary-600 font-semibold">Rent Amount</p>
                      <p className="text-primary-700 font-bold">{formatCurrency(record.rentAmount)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-gray-600 font-semibold">Date Paid</p>
                      <p className="text-gray-700">{formatDate(record.datePaid)}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-700 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center space-x-1"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="flex-1 bg-danger-100 hover:bg-danger-200 text-danger-700 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center space-x-1"
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}