import React from 'react';

const Spinner = () => (
  <svg
    className="spinner w-4 h-4 mr-2"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Controls = ({
  onImport,
  onRescan,
  onStartSending,
  loading,
  sending,
  progress,
  toast,
}) => {
  const isSending = sending?.isRunning;
  const progressPercent =
    sending?.totalBatches > 0
      ? Math.round((sending.currentBatch / sending.totalBatches) * 100)
      : 0;

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Controls</h2>
        <p className="text-sm text-gray-400">Manage contacts and send campaign emails.</p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Import CSV */}
        <button
          onClick={onImport}
          disabled={loading === 'import' || isSending}
          className="flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-white
            bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20
            transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading === 'import' ? (
            <><Spinner /> Importing...</>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
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
          {loading === 'rescan' ? (
            <><Spinner /> Rescanning...</>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Rescan CSV
            </>
          )}
        </button>

        {/* Start Sending */}
        <button
          onClick={onStartSending}
          disabled={isSending || loading === 'sending'}
          className="btn-gradient flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold
            text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <Spinner />
              Sending...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Start Sending Emails
            </>
          )}
        </button>
      </div>

      {/* Toast message */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium animate-fade-in border
            ${toast.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Progress section */}
      {isSending && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-purple-400 font-medium">
              {/* Pulsing dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
              Sending in progress...
            </div>
            <span className="text-gray-400">
              Batch {sending.currentBatch} / {sending.totalBatches}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="progress-shimmer h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{sending.message}</span>
            <span>{progressPercent}%</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center">
              <div className="text-green-400 text-xl font-bold">{sending.sentCount ?? 0}</div>
              <div className="text-gray-500 text-xs mt-0.5">Sent this session</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
              <div className="text-red-400 text-xl font-bold">{sending.failedCount ?? 0}</div>
              <div className="text-gray-500 text-xs mt-0.5">Failed this session</div>
            </div>
          </div>
        </div>
      )}

      {/* Done state */}
      {!isSending && sending?.message === 'All emails processed.' && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium animate-fade-in">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          All emails processed successfully!
        </div>
      )}
    </div>
  );
};

export default Controls;
