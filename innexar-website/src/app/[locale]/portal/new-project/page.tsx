'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
    Rocket, Globe, Smartphone, ShoppingCart, Palette, Code,
    CheckCircle2, ArrowRight, Loader2
} from 'lucide-react';

const projectTypes = [
    { id: 'website', label: 'Business Website', icon: Globe, description: 'Professional website for your business' },
    { id: 'landing', label: 'Landing Page', icon: Rocket, description: 'High-converting single page' },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart, description: 'Online store with payments' },
    { id: 'webapp', label: 'Web Application', icon: Code, description: 'Custom web application' },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone, description: 'iOS and Android app' },
    { id: 'custom', label: 'Custom Project', icon: Palette, description: 'Something unique' },
];

export default function NewProjectPage() {
    const router = useRouter();
    const locale = useLocale();
    const [step, setStep] = useState(1);
    const [projectType, setProjectType] = useState('');
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [timeline, setTimeline] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // TODO: Submit to API
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmitted(true);
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
            >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
                <p className="text-slate-400 mb-6">
                    We'll review your project request and get back to you within 24 hours.
                </p>
                <motion.button
                    onClick={() => router.push(`/${locale}/portal`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium"
                >
                    Back to Dashboard
                    <ArrowRight className="w-4 h-4" />
                </motion.button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Request New Project</h1>
                <p className="text-slate-400">Tell us about your project and we'll get started.</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${step >= s ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/10 text-slate-400'}`}
                        >
                            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                        </div>
                        {s < 3 && <div className={`w-20 h-1 rounded-full ${step > s ? 'bg-blue-500' : 'bg-white/10'}`} />}
                    </div>
                ))}
            </div>

            {/* Form */}
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">What type of project?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projectTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <motion.button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setProjectType(type.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`p-4 rounded-xl border text-left transition-all
                      ${projectType === type.id
                                                ? 'bg-blue-500/20 border-blue-500/50'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <Icon className={`w-6 h-6 mb-3 ${projectType === type.id ? 'text-blue-400' : 'text-slate-400'}`} />
                                        <p className="text-white font-medium">{type.label}</p>
                                        <p className="text-slate-400 text-sm">{type.description}</p>
                                    </motion.button>
                                );
                            })}
                        </div>
                        <div className="flex justify-end">
                            <motion.button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!projectType}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">Project Details</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                                placeholder="My Awesome Project"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                                placeholder="Tell us about your project, goals, and any specific requirements..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium"
                            >
                                Back
                            </button>
                            <motion.button
                                type="button"
                                onClick={() => setStep(3)}
                                disabled={!projectName}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-bold text-white">Budget & Timeline</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Budget Range</label>
                            <select
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="" className="bg-slate-900">Select a range</option>
                                <option value="small" className="bg-slate-900">$500 - $1,500</option>
                                <option value="medium" className="bg-slate-900">$1,500 - $5,000</option>
                                <option value="large" className="bg-slate-900">$5,000 - $15,000</option>
                                <option value="enterprise" className="bg-slate-900">$15,000+</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Timeline</label>
                            <select
                                value={timeline}
                                onChange={(e) => setTimeline(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="" className="bg-slate-900">Select timeline</option>
                                <option value="asap" className="bg-slate-900">ASAP</option>
                                <option value="2weeks" className="bg-slate-900">Within 2 weeks</option>
                                <option value="1month" className="bg-slate-900">Within 1 month</option>
                                <option value="flexible" className="bg-slate-900">Flexible</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium"
                            >
                                Back
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
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Request
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
