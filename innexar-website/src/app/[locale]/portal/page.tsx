'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
    Rocket, Clock, Palette, Eye, CheckCircle2,
    ArrowRight, TrendingUp, Calendar, Zap,
    ExternalLink, FileText, Sparkles
} from 'lucide-react';
import Modal from '@/components/portal/Modal';

interface Project {
    id: number;
    name: string;
    status: string;
    progress: number;
    created_at: string;
    expected_delivery: string | null;
    site_url: string | null;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string; step: number }> = {
    pending_payment: { icon: Clock, color: 'yellow', label: 'Pending Payment', step: 0 },
    paid: { icon: CheckCircle2, color: 'blue', label: 'Payment Confirmed', step: 1 },
    onboarding_pending: { icon: FileText, color: 'orange', label: 'Onboarding Form', step: 1 },
    briefing: { icon: FileText, color: 'cyan', label: 'Briefing Received', step: 1 },
    building: { icon: Palette, color: 'purple', label: 'In Development', step: 2 },
    preview: { icon: Eye, color: 'purple', label: 'Preview Ready', step: 3 },
    review: { icon: Eye, color: 'cyan', label: 'Changes Requested', step: 3 },
    delivered: { icon: Rocket, color: 'green', label: 'Launched', step: 4 },
};

const pipelineSteps = [
    { step: 1, label: 'Payment', icon: CheckCircle2 },
    { step: 2, label: 'Development', icon: Palette },
    { step: 3, label: 'Review', icon: Eye },
    { step: 4, label: 'Launch', icon: Rocket },
];

export default function PortalDashboard() {
    const locale = useLocale();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState('');
    const [documents, setDocuments] = useState<Array<{ id: number; type: string; title: string; content?: string; created_at?: string; metadata?: any }>>([]);
    const [selectedDocument, setSelectedDocument] = useState<{ id: number; type: string; title: string; content: string; metadata?: any } | null>(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            const token = localStorage.getItem('customer_token');
            const email = localStorage.getItem('customer_email');
            if (email) {
                setCustomerName(email.split('@')[0]);
            }
            if (!token) return;

            try {
                const response = await fetch('/api/launch/customer/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Transform orders to projects format
                    const projectsData = data.orders?.map((order: any) => ({
                        id: order.id,
                        name: order.onboarding?.business_name || `Project #${order.id}`,
                        status: order.status,
                        progress: getProgressFromStatus(order.status),
                        created_at: order.created_at,
                        expected_delivery: order.expected_delivery_date,
                        site_url: order.site_url,
                    })) || [];
                    setProjects(projectsData);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const getProgressFromStatus = (status: string): number => {
        const progressMap: Record<string, number> = {
            pending_payment: 0,
            paid: 25,
            onboarding_pending: 25,
            briefing: 25,
            building: 50,
            preview: 75,
            review: 75,
            delivered: 100,
        };
        return progressMap[status] || 0;
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
            yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', gradient: 'from-yellow-500 to-orange-500' },
            blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
            orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400', gradient: 'from-orange-500 to-red-500' },
            purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
            cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 to-blue-500' },
            green: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', gradient: 'from-green-500 to-emerald-500' },
        };
        return colors[color] || colors.blue;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const activeProject = projects[0];
    const activeStatus = activeProject ? statusConfig[activeProject.status] || statusConfig.building : null;

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-slate-400">Client Portal</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back{customerName ? `, ${customerName}` : ''}! 👋
                    </h1>
                    <p className="text-slate-400">Here's what's happening with your projects.</p>
                </div>
                <Link href={`/${locale}/portal/new-project`}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow"
                    >
                        <Zap className="w-4 h-4" />
                        Request New Project
                    </motion.button>
                </Link>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Active Projects', value: projects.filter(p => p.status !== 'delivered').length, icon: Palette, color: 'purple' },
                    { label: 'Completed', value: projects.filter(p => p.status === 'delivered').length, icon: CheckCircle2, color: 'green' },
                    { label: 'Total Projects', value: projects.length, icon: TrendingUp, color: 'blue' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400 text-sm">{stat.label}</span>
                            <div className={`w-10 h-10 rounded-xl ${getColorClasses(stat.color).bg} flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 ${getColorClasses(stat.color).text}`} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Active Project Pipeline */}
            {activeProject && activeStatus && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">{activeProject.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColorClasses(activeStatus.color).bg} ${getColorClasses(activeStatus.color).text} ${getColorClasses(activeStatus.color).border} border`}>
                                    {activeStatus.label}
                                </span>
                                {activeProject.expected_delivery && (
                                    <span className="text-slate-400 text-sm flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        ETA: {new Date(activeProject.expected_delivery).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        {activeProject.site_url && (
                            <motion.a
                                href={activeProject.site_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-medium transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Preview
                            </motion.a>
                        )}
                    </div>

                    {/* Interactive Pipeline */}
                    <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-white/10 rounded-full" />

                        {/* Progress Bar Fill */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${activeProject.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`absolute top-5 left-0 h-1 bg-gradient-to-r ${getColorClasses(activeStatus.color).gradient} rounded-full`}
                        />

                        {/* Steps */}
                        <div className="relative flex justify-between">
                            {pipelineSteps.map((step, i) => {
                                const isComplete = activeProject.progress >= (step.step * 25);
                                const isCurrent = Math.ceil(activeProject.progress / 25) === step.step;
                                const Icon = step.icon;

                                return (
                                    <div key={step.step} className="flex flex-col items-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3 + i * 0.1 }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300
                        ${isComplete
                                                    ? `bg-gradient-to-br ${getColorClasses(activeStatus.color).gradient} shadow-lg`
                                                    : isCurrent
                                                        ? 'bg-white/20 ring-4 ring-blue-500/30'
                                                        : 'bg-white/10'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isComplete || isCurrent ? 'text-white' : 'text-slate-500'}`} />
                                        </motion.div>
                                        <span className={`mt-3 text-sm font-medium ${isComplete || isCurrent ? 'text-white' : 'text-slate-500'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Project Documents */}
            {activeProject && documents.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        Project Documents
                    </h2>
                    <p className="text-slate-400 text-sm mb-4">
                        Review planning documents shared by our team, like sitemap proposals or copy drafts.
                    </p>
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/${locale}/portal/projects/${activeProject.id}`}
                            >
                                <div className="flex items-center justify-between bg-slate-900/40 border border-white/10 rounded-lg px-3 py-2 text-sm hover:bg-slate-900/60 transition-colors cursor-pointer">
                                    <div>
                                        <p className="text-white font-medium">{doc.title}</p>
                                        <p className="text-xs text-slate-400">
                                            {doc.type} {doc.created_at ? `· ${new Date(doc.created_at).toLocaleDateString()}` : ''}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { title: 'Need Help?', desc: 'Contact our support team', icon: '💬', href: `/${locale}/portal/support` },
                    { title: 'Start New Project', desc: 'Request a new website', icon: '🚀', href: `/${locale}/portal/new-project` },
                ].map((action, i) => (
                    <Link key={action.title} href={action.href}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="group bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-6 flex items-center gap-4 transition-all cursor-pointer h-full"
                        >
                            <span className="text-4xl">{action.icon}</span>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
                                <p className="text-slate-400 text-sm">{action.desc}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* All Projects List */}
            {projects.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h2 className="text-xl font-bold text-white mb-4">All Projects</h2>
                    <div className="space-y-3">
                        {projects.map((project) => {
                            const status = statusConfig[project.status] || statusConfig.building;
                            const colors = getColorClasses(status.color);

                            return (
                                <Link key={project.id} href={`/${locale}/portal/projects/${project.id}`}>
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                            <status.icon className={`w-5 h-5 ${colors.text}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium truncate">{project.name}</h3>
                                            <p className="text-slate-400 text-sm">{status.label}</p>
                                        </div>
                                        <div className="hidden md:block w-32">
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${project.progress}%` }}
                                                    className={`h-full bg-gradient-to-r ${colors.gradient}`}
                                                />
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {projects.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Rocket className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Projects Yet</h2>
                    <p className="text-slate-400 mb-6">Start your digital journey by requesting your first project.</p>
                    <Link href={`/${locale}/portal/new-project`}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-shadow"
                        >
                            Start Your First Project
                        </motion.button>
                    </Link>
                </motion.div>
            )}

            {/* Document View Modal */}
            {selectedDocument && (
                <Modal
                    isOpen={showDocumentModal}
                    onClose={() => {
                        setShowDocumentModal(false);
                        setSelectedDocument(null);
                    }}
                    title={selectedDocument.title}
                    size="lg"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <FileText className="w-4 h-4" />
                            <span>{selectedDocument.type}</span>
                            {selectedDocument.id && (
                                <>
                                    <span>·</span>
                                    <span>ID: {selectedDocument.id}</span>
                                </>
                            )}
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-slate-300 font-mono text-sm bg-slate-800/50 p-4 rounded-lg border border-white/10 overflow-x-auto">
                                {selectedDocument.content}
                            </pre>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
