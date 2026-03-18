import React from "react"

function ConfirmModal({ isOpen, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}>
            <div className="rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f0f1e 100%)', borderColor: 'rgba(139, 0, 0, 0.4)' }}>
                <div className="text-center mb-6">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#d0d0d0' }}>Are you sure?</h3>
                    <p style={{ color: '#c0c0c0' }} className="text-sm">{message}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold transition"
                        style={{ color: '#c0c0c0', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition shadow-md"
                        style={{ backgroundColor: '#8b0000' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a00000'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b0000'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
