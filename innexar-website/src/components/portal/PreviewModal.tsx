'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import Modal from './Modal';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    previewUrl: string;
    orderId: number;
    onApprove: () => Promise<void>;
    onRequestRevision: () => void;
}

export default function PreviewModal({
    isOpen,
    onClose,
    previewUrl,
    orderId,
    onApprove,
    onRequestRevision
}: PreviewModalProps) {
    const [approving, setApproving] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const handleApprove = async () => {
        setApproving(true);
        try {
            await onApprove();
            onClose();
        } catch (error) {
            console.error('Error approving:', error);
        } finally {
            setApproving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Review Your Website" size="full">
            <div className="space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-300 text-sm">
                        Please review your website carefully. Once approved, it will be published and delivered.
                    </p>
                </div>

                {/* Preview Frame */}
                <div className="relative bg-slate-950 rounded-xl border border-white/10 overflow-hidden" style={{ height: '70vh' }}>
                    {!iframeLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    )}
                    <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        onLoad={() => setIframeLoaded(true)}
                        title="Website Preview"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleApprove}
                        disabled={approving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {approving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Approving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Approve & Deliver
                            </>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            onRequestRevision();
                            onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-medium transition-colors"
                    >
                        <MessageSquare className="w-5 h-5" />
                        Request Changes
                    </motion.button>

                    <motion.a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-medium transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                        Open in New Tab
                    </motion.a>
                </div>
            </div>
        </Modal>
    );
}
