'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
    MessageSquare, Send, Clock, CheckCircle2, AlertCircle,
    Plus, ArrowRight, Loader2, X
} from 'lucide-react';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    message_count: number;
}

export default function SupportPage() {
    const locale = useLocale();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const token = localStorage.getItem('customer_token');
        if (!token) return;

        try {
            const response = await fetch('/api/launch/customer/tickets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setTickets(data);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const token = localStorage.getItem('customer_token');
        if (!token) return;

        try {
            const response = await fetch('/api/launch/customer/tickets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subject, message }),
            });

            if (response.ok) {
                setSubject('');
                setMessage('');
                setShowForm(false);
                fetchTickets();
            } else {
                const data = await response.json();
                setError(data.detail || 'Failed to create ticket');
            }
        } catch (error) {
            setError('Connection error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
            open: { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Open' },
            pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pending Response' },
            resolved: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Resolved' },
            closed: { icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Closed' },
        };
        return configs[status] || configs.open;
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'text-slate-400',
            medium: 'text-blue-400',
            high: 'text-orange-400',
            urgent: 'text-red-400',
        };
        return colors[priority] || colors.medium;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
                    <p className="text-slate-400">Get help with your projects and account.</p>
                </div>
                <motion.button
                    onClick={() => setShowForm(!showForm)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg shadow-blue-500/25"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'New Ticket'}
                </motion.button>
            </div>

            {/* New Ticket Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Create Support Ticket</h2>

                            {error && (
                                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                                        placeholder="Brief description of your issue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                                        placeholder="Describe your issue in detail..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={submitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Submit Ticket
                                                <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tickets List */}
            {tickets.length > 0 ? (
                <div className="space-y-4">
                    {tickets.map((ticket, index) => {
                        const status = getStatusConfig(ticket.status);
                        const StatusIcon = status.icon;

                        return (
                            <motion.div
                                key={ticket.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/${locale}/portal/support/${ticket.id}`}>
                                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center`}>
                                                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium">{ticket.subject}</h3>
                                                    <p className="text-slate-400 text-sm">
                                                        {ticket.message_count} message{ticket.message_count !== 1 ? 's' : ''} •
                                                        Updated {new Date(ticket.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} border border-current/30`}>
                                                    {status.label}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Support Tickets</h2>
                    <p className="text-slate-400 mb-6">You haven't created any support tickets yet.</p>
                    <motion.button
                        onClick={() => setShowForm(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Create Your First Ticket
                    </motion.button>
                </motion.div>
            )}

            {/* Quick Contact */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Quick Contact</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <a
                        href="mailto:support@innexar.com"
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Email Support</p>
                            <p className="text-slate-400 text-sm">support@innexar.com</p>
                        </div>
                    </a>
                    <a
                        href="https://wa.me/14074736081"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-white font-medium">WhatsApp</p>
                            <p className="text-slate-400 text-sm">Quick response</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
