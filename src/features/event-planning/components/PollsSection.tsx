"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    CheckCircle2,
    Users,
    X,
    BarChart3,
    Vote,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPollsForEvent, createPoll, voteInPoll } from '@/lib/api/events';

interface PollOption {
    id: string;
    optionText: string;
    voteCount: number;
    voters: string[];
}

interface Poll {
    id: string;
    title: string;
    options: PollOption[];
    hasVoted: boolean;
}

export default function PollsSection({ eventId }: { eventId: string }) {
    const { user } = useAuth();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newPollBody, setNewPollBody] = useState({ title: '', options: ['', ''] });
    const [loading, setLoading] = useState(true);
    const [expandedVoters, setExpandedVoters] = useState<string | null>(null);

    const fetchPolls = useCallback(async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const data = await getPollsForEvent(token, eventId);
            setPolls(data);
        } catch (err) {
            console.error("Failed to fetch polls", err);
        } finally {
            setLoading(false);
        }
    }, [user, eventId]);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    const handleVote = async (pollId: string, optionId: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            await voteInPoll(token, pollId, optionId);
            await fetchPolls(); // Refresh to get updated vote counts
        } catch (err) {
            console.error("Failed to vote", err);
        }
    };

    const handleCreate = async () => {
        if (!user || !newPollBody.title || newPollBody.options.some(o => !o)) return;
        try {
            const token = await user.getIdToken();
            await createPoll(token, {
                eventId,
                title: newPollBody.title,
                options: newPollBody.options
            });
            setShowCreate(false);
            setNewPollBody({ title: '', options: ['', ''] });
            fetchPolls();
        } catch (err) {
            console.error("Failed to create poll", err);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading polls...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-charcoal flex items-center gap-2">
                    <Vote size={18} className="text-primary" /> Team Polls
                </h3>
                <button
                    onClick={() => setShowCreate(true)}
                    className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>

            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border-2 border-primary/20 p-4 rounded-xl shadow-xl space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-primary">New Poll</span>
                            <button onClick={() => setShowCreate(false)}><X size={16} /></button>
                        </div>
                        <input
                            placeholder="What are we deciding?"
                            className="w-full text-sm font-bold border-b border-slate-100 py-2 outline-none focus:border-primary"
                            value={newPollBody.title}
                            onChange={e => setNewPollBody({ ...newPollBody, title: e.target.value })}
                        />
                        <div className="space-y-2">
                            {newPollBody.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <input
                                        placeholder={`Option ${idx + 1}`}
                                        className="flex-1 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 outline-none"
                                        value={opt}
                                        onChange={e => {
                                            const next = [...newPollBody.options];
                                            next[idx] = e.target.value;
                                            setNewPollBody({ ...newPollBody, options: next });
                                        }}
                                    />
                                    {newPollBody.options.length > 2 && (
                                        <button
                                            onClick={() => setNewPollBody({ ...newPollBody, options: newPollBody.options.filter((_, i) => i !== idx) })}
                                            className="text-slate-300 hover:text-red-400"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => setNewPollBody({ ...newPollBody, options: [...newPollBody.options, ''] })}
                                className="text-[10px] font-bold text-slate-400 hover:text-primary flex items-center gap-1"
                            >
                                <Plus size={12} /> Add Option
                            </button>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Launch Poll
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {polls.length === 0 && (
                    <div className="flex flex-col items-center py-8 gap-3 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <BarChart3 size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-slate-400 italic">No active polls. Create one above!</p>
                    </div>
                )}
                {polls.map((poll) => {
                    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.voteCount, 0);
                    const myVotedOptionId = poll.options.find(o => o.voters.includes(user?.uid || ''))?.id;

                    return (
                        <motion.div
                            key={poll.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm"
                        >
                            <h4 className="font-bold text-sm text-charcoal mb-4 flex items-center gap-2">
                                <BarChart3 size={14} className="text-primary" />
                                {poll.title}
                            </h4>
                            <div className="space-y-2">
                                {poll.options.map((option, idx) => {
                                    const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
                                    const isMyVote = option.id === myVotedOptionId;
                                    const optionLabel = String.fromCharCode(65 + idx);

                                    return (
                                        <div key={option.id} className="space-y-1">
                                            <button
                                                onClick={() => handleVote(poll.id, option.id)}
                                                className="w-full text-left relative group overflow-hidden rounded-lg"
                                            >
                                                <div
                                                    className={`absolute inset-0 transition-all duration-700 rounded-lg ${isMyVote ? 'bg-primary/15' : 'bg-slate-50 group-hover:bg-slate-100'}`}
                                                    style={{ width: `${Math.max(percentage, 4)}%` }}
                                                />
                                                <div className="relative p-2.5 flex justify-between items-center text-xs font-bold transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${isMyVote ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-400'}`}>
                                                            {isMyVote ? <CheckCircle2 size={10} /> : optionLabel}
                                                        </span>
                                                        <span className={isMyVote ? 'text-primary' : 'text-slate-600'}>
                                                            {option.optionText}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold ${isMyVote ? 'text-primary' : 'text-slate-400'}`}>
                                                            {option.voteCount} {option.voteCount === 1 ? 'vote' : 'votes'}
                                                        </span>
                                                        {totalVotes > 0 && (
                                                            <span className="text-[10px] text-slate-300">
                                                                ({Math.round(percentage)}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Show voters for this option */}
                                            {option.voteCount > 0 && (
                                                <div className="px-2">
                                                    <button
                                                        onClick={() => setExpandedVoters(expandedVoters === `${poll.id}-${option.id}` ? null : `${poll.id}-${option.id}`)}
                                                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-primary transition-colors"
                                                    >
                                                        <Users size={10} />
                                                        <span>{option.voteCount} {option.voteCount === 1 ? 'voter' : 'voters'}</span>
                                                        {expandedVoters === `${poll.id}-${option.id}` ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                                    </button>
                                                    <AnimatePresence>
                                                        {expandedVoters === `${poll.id}-${option.id}` && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {option.voters.map((voterId) => (
                                                                        <span
                                                                            key={voterId}
                                                                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${voterId === user?.uid ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}
                                                                        >
                                                                            {voterId === user?.uid ? 'You' : voterId.slice(0, 8) + '...'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                <Users size={12} />
                                <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
                                {myVotedOptionId && (
                                    <span className="ml-auto text-primary flex items-center gap-1">
                                        <CheckCircle2 size={10} /> You voted
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
