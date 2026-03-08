import React, { useState, useEffect, useCallback, useRef } from 'react';
import Stats from './Stats';
import Controls from './Controls';
import EmailTable from './EmailTable';
import {
  importCSV,
  rescanCSV,
  startSending,
  getStats,
  getContacts,
  getProgress,
} from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [sending, setSending] = useState(null);
  const [loading, setLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  const pollRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await getStats();
      setStats(res.data.stats);
      setSending(res.data.sending);
    } catch {}
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await getContacts({ page, limit: 50, status: filter || undefined });
      setContacts(res.data.contacts);
      setPagination(res.data.pagination);
    } catch {}
  }, [page, filter]);

  useEffect(() => {
    fetchStats();
    fetchContacts();
  }, [fetchStats, fetchContacts]);

  // Poll progress while sending
  useEffect(() => {
    if (sending?.isRunning) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await getProgress();
          setSending(res.data.progress);
          // Also refresh stats every poll cycle
          const statsRes = await getStats();
          setStats(statsRes.data.stats);
          // If done, refresh contacts too
          if (!res.data.progress.isRunning) {
            fetchContacts();
            clearInterval(pollRef.current);
          }
        } catch {}
      }, 2000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [sending?.isRunning, fetchContacts]);

  const handleImport = async () => {
    setLoading('import');
    try {
      const res = await importCSV();
      showToast(res.data.message, 'success');
      fetchStats();
      fetchContacts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Import failed.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleRescan = async () => {
    setLoading('rescan');
    try {
      const res = await rescanCSV();
      showToast(res.data.message, 'success');
      fetchStats();
      fetchContacts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Rescan failed.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleStartSending = async () => {
    setLoading('sending');
    try {
      const res = await startSending();
      showToast(res.data.message, 'success');
      // Trigger polling
      const statsRes = await getStats();
      setSending(statsRes.data.sending);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start sending.', 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Reachly</h1>
            <p className="text-gray-500 text-sm mt-1">
              Automated personalized HR outreach — built for job seekers.
            </p>
          </div>
          <button
            onClick={() => { fetchStats(); fetchContacts(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10
              text-gray-400 hover:text-white text-sm transition-all duration-200 hover:bg-white/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats cards */}
        <Stats stats={stats} />

        {/* Controls */}
        <Controls
          onImport={handleImport}
          onRescan={handleRescan}
          onStartSending={handleStartSending}
          loading={loading}
          sending={sending}
          toast={toast}
        />

        {/* Email History Table */}
        <EmailTable
          contacts={contacts}
          pagination={pagination}
          onPageChange={setPage}
          onFilterChange={setFilter}
          filter={filter}
        />

      </div>
    </div>
  );
};

export default Dashboard;
