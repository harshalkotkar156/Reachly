import React, { useState } from 'react';

const Spinner = () => (
  <svg className="spinner w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Controls = ({
  onImport,
  onRescan,
  onStartSending,
  onStopSending,
  onRetryFailed,
  loading,
  sending,
  stats,
  toast,
}) => {
  const [emailCount, setEmailCount] = useState(20);

  const isSending = sending?.isRunning;
  const isStopRequested = sending?.stopRequested;

  const progressPercent =
    sending?.totalBatches > 0
      ? Math.round((sending.currentBatch / sending.totalBatches) * 100)
      : 0;

  const handleCountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) setEmailCount(val);
  };

  const doneMessage =
    !isSending &&
    sending?.message &&
    (sending.message.startsWith('Done!') || sending.message.startsWith('Stopped.'));

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Controls</h2>
        <p className="text-sm text-gray-400">Choose how many emails to send, then start.</p>
      </div>

      {/* Count input row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Number input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Emails to send
          </label>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-colors">
            <input
              type="number"
              min="1"
              max="10000"
              value={emailCount}
              onChange={handleCountChange}
              disabled={isSending}
              className="bg-transparent text-white text-sm font-semibold px-4 py-2.5 w-28
                outline-none placeholder-gray-600 disabled:opacity-40"
            />
            <div className="flex flex-col border-l border-white/10">
              <button
                onClick={() => setEmailCount((v) => Math.min(v + 10, 10000))}
                disabled={isSending}
                className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-white/10
                  disabled:opacity-30 transition-colors text-xs leading-none"
              >▲</button>
              <button
                onClick={() => setEmailCount((v) => Math.max(v - 10, 1))}
                disabled={isSending}
                className="px-2.5 py-1 text-gray-400 hover:text-white hover:bg-white/10
                  disabled:opacity-30 transition-colors text-xs leading-none border-t border-white/10"
              >▼</button>
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quick set</label>
          <div className="flex gap-2">
            {[10, 20, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setEmailCount(n)}
                disabled={isSending}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed
                  ${emailCount === n
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">

        {/* Import CSV */}
        <button
          onClick={onImport}
          disabled={loading === 'import' || isSending}
          className="flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-white
            bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20
            transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading === 'import' ? <><Spinner />Importing...</> : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import CSV
            </>
          )}
        </button>

        {/* Rescan CSV */}
        <button
          onClick={onRescan}
          disabled={loading === 'rescan' || isSending}
          className="flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-white
            bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20
            transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading === 'rescan' ? <><Spinner />Rescanning...</> : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rescan CSV
            </>
          )}
        </button>

        {/* Send button — hidden while sending */}
        {!isSending && (
          <button
            onClick={() => onStartSending(emailCount)}
            disabled={loading === 'sending'}
            className="btn-gradient flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg"
          >
            {loading === 'sending' ? <><Spinner />Starting...</> : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send {emailCount} Emails
              </>
            )}
          </button>
        )}

        {/* Stop button — only while sending */}
        {isSending && (
          <button
            onClick={onStopSending}
            disabled={isStopRequested}
            className="flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-red-500/80 hover:bg-red-500 border border-red-500/30 shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isStopRequested ? <><Spinner />Stopping...</> : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop Sending
              </>
            )}
          </button>
        )}

        {/* Retry Failed — only when failed > 0 and not currently sending */}
        {!isSending && stats?.failed > 0 && (
          <button
            onClick={onRetryFailed}
            disabled={loading === 'retry'}
            className="flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-white
              bg-orange-500/15 border border-orange-500/30 hover:bg-orange-500/25
              transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading === 'retry' ? <><Spinner />Resetting...</> : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Failed ({stats.failed})
              </>
            )}
          </button>
        )}
      </div>

      {/* Toast message */}
      {toast && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium animate-fade-in border
          ${toast.type === 'success'
            ? 'bg-green-500/10 text-green-400 border-green-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
        >
          {toast.message}
        </div>
      )}

      {/* Live progress — shown while sending */}
      {isSending && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-purple-400 font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500" />
              </span>
              {isStopRequested ? 'Stopping after current batch...' : 'Sending in progress...'}
            </div>
            <span className="text-gray-400 font-mono text-xs">
              Batch {sending.currentBatch} / {sending.totalBatches}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                isStopRequested ? 'bg-orange-400' : 'progress-shimmer'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{sending.message}</span>
            <span>{progressPercent}%</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-3 text-center">
              <div className="text-white text-xl font-bold">{sending.totalToSend ?? 0}</div>
              <div className="text-gray-500 text-xs mt-0.5">Queued</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-3 text-center">
              <div className="text-green-400 text-xl font-bold">{sending.sentCount ?? 0}</div>
              <div className="text-gray-500 text-xs mt-0.5">Sent</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-3 text-center">
              <div className="text-red-400 text-xl font-bold">{sending.failedCount ?? 0}</div>
              <div className="text-gray-500 text-xs mt-0.5">Failed</div>
            </div>
          </div>
        </div>
      )}

      {/* Done / Stopped state */}
      {doneMessage && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in border
          ${sending.message.startsWith('Stopped')
            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            : 'bg-green-500/10 text-green-400 border-green-500/20'}`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sending.message.startsWith('Stopped')
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 13l4 4L19 7" />
            }
          </svg>
          {sending.message}
        </div>
      )}
    </div>
  );
};

export default Controls;
