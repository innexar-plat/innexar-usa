'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileText, AlertCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';

interface RevisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    revisionsUsed: number;
    revisionsIncluded: number;
    onSubmit: (message: string, attachments: string[]) => Promise<void>;
}

export default function RevisionModal({
    isOpen,
    onClose,
    orderId,
    revisionsUsed,
    revisionsIncluded,
    onSubmit
}: RevisionModalProps) {
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const revisionsRemaining = revisionsIncluded - revisionsUsed;
    const isExtraRevision = revisionsRemaining <= 0;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            // TODO: Implement actual file upload to storage
            // For now, we'll just store the file names
            const fileNames = Array.from(files).map(f => f.name);
            setAttachments([...attachments, ...fileNames]);
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            alert('Please describe the changes you need');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(message, attachments);
            setMessage('');
            setAttachments([]);
            onClose();
        } catch (error) {
            console.error('Error submitting revision:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Changes" size="lg">
            <div className="space-y-6">
                {/* Revision Counter */}
                <div className={`rounded-xl p-4 border ${isExtraRevision ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`font-medium ${isExtraRevision ? 'text-amber-300' : 'text-blue-300'}`}>
                                Revisions: {revisionsUsed} / {revisionsIncluded} used
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                {isExtraRevision
                                    ? 'Additional revisions may incur extra charges'
                                    : `${revisionsRemaining} revision${revisionsRemaining !== 1 ? 's' : ''} remaining`}
                            </p>
                        </div>
                        {isExtraRevision && (
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                        )}
                    </div>
                </div>

                {/* Message Input */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Describe the changes you need
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please be as specific as possible. For example: 'Change the header color to blue', 'Add a contact form on the homepage', etc."
                        className="w-full h-32 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Attachments (screenshots, references, etc.)
                    </label>
                    <div className="space-y-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white cursor-pointer hover:bg-slate-700 transition-colors"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Upload Files
                                </>
                            )}
                        </label>

                        {/* Attachments List */}
                        {attachments.length > 0 && (
                            <div className="space-y-2">
                                {attachments.map((attachment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-white">{attachment}</span>
                                        </div>
                                        <button
                                            onClick={() => removeAttachment(index)}
                                            className="text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-medium transition-colors"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={submitting || !message.trim()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </motion.button>
                </div>
            </div>
        </Modal>
    );
}
