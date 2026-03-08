import React, { useState } from 'react';

const statusConfig = {
  sent: {
    label: 'Sent',
    className: 'bg-green-500/15 text-green-400 border-green-500/25',
    dot: 'bg-green-400',
  },
  pending: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    dot: 'bg-yellow-400',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500/15 text-red-400 border-red-500/25',
    dot: 'bg-red-400',
  },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const EmailTable = ({ contacts, pagination, onPageChange, onFilterChange, filter }) => {
  const isEmpty = !contacts || contacts.length === 0;

  return (
    <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
      {/* Table header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-white/8">
        <h2 className="text-lg font-semibold text-white">Email History</h2>
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {['', 'pending', 'sent', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => { onFilterChange(f); onPageChange(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                ${filter === f
                  ? 'bg-white/15 text-white shadow'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-6 py-3 text-left font-medium">Email</th>
              <th className="px-6 py-3 text-left font-medium hidden md:table-cell">Company</th>
              <th className="px-6 py-3 text-left font-medium hidden lg:table-cell">Title</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium hidden sm:table-cell">Sent Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isEmpty ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <span>No contacts found. Import a CSV to get started.</span>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact._id}
                  className="hover:bg-white/[0.03] transition-colors duration-150"
                >
                  <td className="px-6 py-3.5 text-white font-medium">{contact.name || '—'}</td>
                  <td className="px-6 py-3.5 text-gray-300 font-mono text-xs">{contact.email}</td>
                  <td className="px-6 py-3.5 text-gray-400 hidden md:table-cell">{contact.company || '—'}</td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs hidden lg:table-cell">{contact.title || '—'}</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={contact.status} />
                  </td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs hidden sm:table-cell">
                    {formatDate(contact.sentAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 text-sm">
          <span className="text-gray-500 text-xs">
            Page {pagination.page} of {pagination.pages} &nbsp;·&nbsp; {pagination.total.toLocaleString()} total
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400
                hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150 text-xs"
            >
              ← Prev
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400
                hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150 text-xs"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTable;
