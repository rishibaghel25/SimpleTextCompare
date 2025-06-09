import React, { useState, useCallback, useMemo } from 'react';
import {
    Copy,
    ArrowRight,
    ArrowLeft,
    Download,
    Trash2,
    FileText,
    Sparkles,
    RotateCcw,
    Check,
    Github,
    Linkedin
} from 'lucide-react';
import Header from './Header.jsx';
import { calculateDiff, ActionButton, TextArea, DiffLine, SuccessToast } from './DiffViewer.jsx';

// Main App Component
export default function SimpleTextCompare() {
    const [leftText, setLeftText] = useState('');
    const [rightText, setRightText] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const showSuccessToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const hideToast = () => setShowToast(false);

    // Calculate differences
    const differences = useMemo(() => {
        if (!leftText && !rightText) return [];
        return calculateDiff(leftText, rightText);
    }, [leftText, rightText]);

    const stats = useMemo(() => {
        const added = differences.filter(d => d.type === 'added').length;
        const removed = differences.filter(d => d.type === 'removed').length;
        const changed = differences.filter(d => d.type === 'changed').length;
        const equal = differences.filter(d => d.type === 'equal').length;

        return { added, removed, changed, equal, total: differences.length };
    }, [differences]);

    // Action handlers
    const copyLeftToRight = useCallback(() => {
        setRightText(leftText);
        showSuccessToast('Copied left text to right!');
    }, [leftText]);

    const copyRightToLeft = useCallback(() => {
        setLeftText(rightText);
        showSuccessToast('Copied right text to left!');
    }, [rightText]);

    const clearAll = useCallback(() => {
        setLeftText('');
        setRightText('');
        showSuccessToast('All text cleared!');
    }, []);

    const downloadComparison = useCallback(() => {
        const timestamp = new Date().toISOString().split('T')[0];
        const content = `SimpleTextCompare Results - ${timestamp}\n\n` +
            `STATISTICS:\n` +
            `- Total lines: ${stats.total}\n` +
            `- Equal lines: ${stats.equal}\n` +
            `- Changed lines: ${stats.changed}\n` +
            `- Added lines: ${stats.added}\n` +
            `- Removed lines: ${stats.removed}\n\n` +
            `LEFT TEXT:\n${'='.repeat(50)}\n${leftText}\n\n` +
            `RIGHT TEXT:\n${'='.repeat(50)}\n${rightText}\n\n` +
            `DIFFERENCES:\n${'='.repeat(50)}\n` +
            differences.map(diff => {
                switch (diff.type) {
                    case 'added':
                        return `+ Line ${diff.lineNumber}: ${diff.content}`;
                    case 'removed':
                        return `- Line ${diff.lineNumber}: ${diff.content}`;
                    case 'changed':
                        return `~ Line ${diff.lineNumber}:\n  OLD: ${diff.content1}\n  NEW: ${diff.content2}`;
                    default:
                        return `  Line ${diff.lineNumber}: ${diff.content}`;
                }
            }).join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `text-comparison-${timestamp}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showSuccessToast('Comparison downloaded!');
    }, [leftText, rightText, differences, stats]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Header />

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-6 glass-effect rounded-2xl animate-slide-up">
                    <ActionButton onClick={copyLeftToRight} icon={ArrowRight} disabled={!leftText}>
                        Copy Left → Right
                    </ActionButton>
                    <ActionButton onClick={copyRightToLeft} icon={ArrowLeft} disabled={!rightText}>
                        Copy Right → Left
                    </ActionButton>
                    <ActionButton onClick={downloadComparison} icon={Download} variant="secondary" disabled={!leftText && !rightText}>
                        Download Results
                    </ActionButton>
                    <ActionButton onClick={clearAll} icon={Trash2} variant="danger" disabled={!leftText && !rightText}>
                        Clear All
                    </ActionButton>
                </div>

                {/* Text Input Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4 animate-fade-in">
                        <TextArea
                            value={leftText}
                            onChange={setLeftText}
                            placeholder="Paste your first text here..."
                            label="Original Text"
                        />
                    </div>
                    <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <TextArea
                            value={rightText}
                            onChange={setRightText}
                            placeholder="Paste your second text here..."
                            label="Modified Text"
                        />
                    </div>
                </div>

                {/* Statistics */}
                {(leftText || rightText) && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg animate-slide-up">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-primary-500" />
                            Comparison Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 bg-gray-100 rounded-xl">
                                <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                                <div className="text-sm text-gray-600">Total Lines</div>
                            </div>
                            <div className="text-center p-4 bg-green-100 rounded-xl">
                                <div className="text-2xl font-bold text-green-700">{stats.equal}</div>
                                <div className="text-sm text-green-600">Equal</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-100 rounded-xl">
                                <div className="text-2xl font-bold text-yellow-700">{stats.changed}</div>
                                <div className="text-sm text-yellow-600">Changed</div>
                            </div>
                            <div className="text-center p-4 bg-green-100 rounded-xl">
                                <div className="text-2xl font-bold text-green-700">{stats.added}</div>
                                <div className="text-sm text-green-600">Added</div>
                            </div>
                            <div className="text-center p-4 bg-red-100 rounded-xl">
                                <div className="text-2xl font-bold text-red-700">{stats.removed}</div>
                                <div className="text-sm text-red-600">Removed</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Differences Display */}
                {differences.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-slide-up">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-500" />
                            Line by Line Comparison
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {differences.map((diff, index) => (
                                <DiffLine key={index} diff={diff} index={index} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!leftText && !rightText && (
                    <div className="text-center py-16 animate-fade-in">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-primary-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-4">Start Comparing Texts</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Paste your texts in the boxes above to see a detailed comparison with highlighting and statistics.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center py-8 mt-16 border-t border-gray-200">
                    <p className="text-gray-600 mb-2">
                        Made with ❤️ using React & Tailwind CSS by Rishi
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <a href="https://github.com/rishibaghel25" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-primary-500 transition-colors"><Github className="w-6 h-6" /></a>
                        <a href="https://www.linkedin.com/in/rishinaman/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-primary-500 transition-colors"><Linkedin className="w-6 h-6" /></a>
                    </div>
                </footer>
            </div>

            <SuccessToast message={toastMessage} show={showToast} onHide={hideToast} />
        </div>
    );
}