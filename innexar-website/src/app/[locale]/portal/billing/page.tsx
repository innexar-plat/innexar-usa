'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Download, CheckCircle2, Clock, CreditCard, Calendar } from 'lucide-react';

interface Invoice {
    id: number;
    project_name: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    date: string;
    due_date: string;
}

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch from API
        const fetchInvoices = async () => {
            const token = localStorage.getItem('customer_token');
            if (!token) return;

            try {
                const response = await fetch('/api/launch/customer/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Transform orders to invoices
                    const invoicesData = data.orders?.map((order: any) => ({
                        id: order.id,
                        project_name: order.onboarding?.business_name || `Project #${order.id}`,
                        amount: order.total_price,
                        status: 'paid' as const,
                        date: order.created_at,
                        due_date: order.created_at,
                    })) || [];
                    setInvoices(invoicesData);
                }
            } catch (error) {
                console.error('Error fetching invoices:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { icon: React.ElementType; color: string; label: string; bg: string }> = {
            paid: { icon: CheckCircle2, color: 'text-green-400', label: 'Paid', bg: 'bg-green-500/20' },
            pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending', bg: 'bg-yellow-500/20' },
            overdue: { icon: Clock, color: 'text-red-400', label: 'Overdue', bg: 'bg-red-500/20' },
        };
        return configs[status] || configs.pending;
    };

    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalPending = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);

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
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Billing & Invoices</h1>
                <p className="text-slate-400">View your payment history and invoices.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Paid', value: `$${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: 'green' },
                    { label: 'Pending', value: `$${totalPending.toLocaleString()}`, icon: Clock, color: 'yellow' },
                    { label: 'Total Invoices', value: invoices.length, icon: Receipt, color: 'blue' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400 text-sm">{stat.label}</span>
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Invoices Table */}
            {invoices.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">Invoice History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Invoice</th>
                                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Project</th>
                                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Date</th>
                                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Amount</th>
                                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Status</th>
                                    <th className="text-right px-6 py-4 text-slate-400 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => {
                                    const status = getStatusConfig(invoice.status);
                                    const Icon = status.icon;

                                    return (
                                        <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-white font-medium">INV-{invoice.id.toString().padStart(4, '0')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-300">{invoice.project_name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-400 text-sm flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(invoice.date).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white font-medium">${invoice.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                                    <Download className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Receipt className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Invoices Yet</h2>
                    <p className="text-slate-400">Your invoice history will appear here.</p>
                </motion.div>
            )}

            {/* Payment Methods */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <h2 className="text-lg font-bold text-white mb-4">Payment Methods</h2>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-white font-medium">Stripe Payments</p>
                        <p className="text-slate-400 text-sm">Secure payment processing</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
