import React from 'react'
import { Loader2, X } from 'lucide-react'

const TransferLoading = ({ onCancel }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-base-200 rounded-lg border border-base-300">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span className="text-lg font-medium text-base-content">Connecting to live agent...</span>
      </div>
      
      <div className="w-full max-w-xs bg-base-100 rounded-full h-2 mb-4">
        <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
      
      <p className="text-sm text-base-content/70 text-center mb-4">
        Please wait while we connect you to the next available agent. This may take a few moments.
      </p>
      
      <button
        onClick={onCancel}
        className="flex items-center gap-2 px-4 py-2 bg-error text-error-content rounded-lg hover:bg-error-focus transition-colors text-sm"
      >
        <X size={16} />
        Cancel Transfer
      </button>
    </div>
  )
}

export default TransferLoading
