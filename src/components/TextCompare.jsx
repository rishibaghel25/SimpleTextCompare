import React, { useState, useCallback, useMemo } from 'react';
import {
    Copy,
    ArrowRight,
    ArrowLeft,
    Download,
    Trash2,
    FileText,
    RotateCcw,
    Check,
    Github,
    Linkedin,
    Settings
} from 'lucide-react';

// Advanced diff algorithm for word-level comparison
const diffWords = (text1, text2) => {
  const words1 = text1.split(/(\s+)/);
  const words2 = text2.split(/(\s+)/);
  const result = [];
  
  let i = 0, j = 0;
  
  while (i < words1.length || j < words2.length) {
    if (i >= words1.length) {
      // Remaining words in text2 are additions
      while (j < words2.length) {
        result.push({ type: 'added', value: words2[j] });
        j++;
      }
    } else if (j >= words2.length) {
      // Remaining words in text1 are deletions
      while (i < words1.length) {
        result.push({ type: 'removed', value: words1[i] });
        i++;
      }
    } else if (words1[i] === words2[j]) {
      // Words are the same
      result.push({ type: 'equal', value: words1[i] });
      i++;
      j++;
    } else {
      // Words are different - find the best match
      let foundMatch = false;
      
      // Look ahead to see if we can find a match
      for (let k = 1; k <= Math.min(5, Math.max(words1.length - i, words2.length - j)); k++) {
        if (i + k < words1.length && words1[i + k] === words2[j]) {
          // Found match in text1, mark intervening words as removed
          for (let l = 0; l < k; l++) {
            result.push({ type: 'removed', value: words1[i + l] });
          }
          result.push({ type: 'equal', value: words1[i + k] });
          i += k + 1;
          j++;
          foundMatch = true;
          break;
        } else if (j + k < words2.length && words1[i] === words2[j + k]) {
          // Found match in text2, mark intervening words as added
          for (let l = 0; l < k; l++) {
            result.push({ type: 'added', value: words2[j + l] });
          }
          result.push({ type: 'equal', value: words2[j + k] });
          i++;
          j += k + 1;
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        // No match found, mark as changed
        result.push({ type: 'removed', value: words1[i] });
        result.push({ type: 'added', value: words2[j] });
        i++;
        j++;
      }
    }
  }
  
  return result;
};

// Enhanced diff algorithm for line-by-line with word-level details
const calculateAdvancedDiff = (text1, text2) => {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const maxLines = Math.max(lines1.length, lines2.length);
  const diff = [];

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';
    
    if (line1 === line2) {
      diff.push({ 
        type: 'equal', 
        content: line1, 
        lineNumber: i + 1,
        wordDiff: null
      });
    } else if (lines1[i] === undefined) {
      diff.push({ 
        type: 'added', 
        content: line2, 
        lineNumber: i + 1,
        wordDiff: null
      });
    } else if (lines2[i] === undefined) {
      diff.push({ 
        type: 'removed', 
        content: line1, 
        lineNumber: i + 1,
        wordDiff: null
      });
    } else {
      // Lines are different - calculate word-level diff
      const wordDiff = diffWords(line1, line2);
      diff.push({ 
        type: 'changed', 
        content1: line1, 
        content2: line2, 
        lineNumber: i + 1,
        wordDiff: wordDiff
      });
    }
  }
  
  return diff;
};

// Word diff renderer
const WordDiffRenderer = ({ wordDiff }) => {
  if (!wordDiff) return null;
  
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1">
        {wordDiff.map((word, index) => {
          let className = "px-1 rounded";
          
          switch (word.type) {
            case 'added':
              className += " bg-green-200 text-green-800";
              break;
            case 'removed':
              className += " bg-red-200 text-red-800 line-through";
              break;
            case 'equal':
              className += " text-gray-700";
              break;
            default:
              className += " text-gray-700";
          }
          
          return (
            <span key={index} className={className}>
              {word.value}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Diff Line Component
const EnhancedDiffLine = ({ diff, index, showWordDiff }) => {
  const getLineClass = (type) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'changed':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'added':
        return <span className="text-green-600 font-bold">+</span>;
      case 'removed':
        return <span className="text-red-600 font-bold">-</span>;
      case 'changed':
        return <span className="text-yellow-600 font-bold">~</span>;
      default:
        return <span className="text-gray-500 font-bold">=</span>;
    }
  };

  return (
    <div className={`p-4 mb-2 rounded-lg ${getLineClass(diff.type)} animate-slide-up shadow-sm`} style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2 min-w-[4rem]">
          {getTypeIcon(diff.type)}
          <span className="text-xs font-mono text-gray-600">
            {diff.lineNumber}
          </span>
        </div>
        <div className="flex-1 font-mono text-sm">
          {diff.type === 'changed' ? (
            <div className="space-y-3">
              {showWordDiff && diff.wordDiff ? (
                <WordDiffRenderer wordDiff={diff.wordDiff} />
              ) : (
                <>
                  <div className="bg-red-100 p-2 rounded border-l-2 border-red-300">
                    <span className="text-xs font-semibold text-red-600 block mb-1">Original:</span>
                    <span className="text-red-700">{diff.content1 || '(empty line)'}</span>
                  </div>
                  <div className="bg-green-100 p-2 rounded border-l-2 border-green-300">
                    <span className="text-xs font-semibold text-green-600 block mb-1">Modified:</span>
                    <span className="text-green-700">{diff.content2 || '(empty line)'}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <span className={diff.type === 'added' ? 'text-green-700' : diff.type === 'removed' ? 'text-red-700' : 'text-gray-700'}>
              {diff.content || '(empty line)'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ onClick, icon: Icon, children, variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg";
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-xl",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 hover:shadow-xl"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
};

// Text Area Component
const TextArea = ({ value, onChange, placeholder, label }) => (
  <div className="flex-1 flex flex-col">
    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      {label}
      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
        {value.split('\n').length} lines, {value.split(/\s+/).filter(w => w).length} words
      </span>
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-96 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md font-mono text-sm leading-relaxed"
      style={{ minHeight: '384px' }}
    />
  </div>
);

// Success Toast Component
const SuccessToast = ({ message, show, onHide }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2">
        <Check className="w-5 h-5" />
        {message}
      </div>
    </div>
  );
};

// Main App Component
export default function AdvancedTextCompare() {
    const [leftText, setLeftText] = useState('');
    const [rightText, setRightText] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showWordDiff, setShowWordDiff] = useState(true);

    const showSuccessToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const hideToast = () => setShowToast(false);

    // Calculate differences
    const differences = useMemo(() => {
        if (!leftText && !rightText) return [];
        return calculateAdvancedDiff(leftText, rightText);
    }, [leftText, rightText]);

    const stats = useMemo(() => {
        const added = differences.filter(d => d.type === 'added').length;
        const removed = differences.filter(d => d.type === 'removed').length;
        const changed = differences.filter(d => d.type === 'changed').length;
        const equal = differences.filter(d => d.type === 'equal').length;

        // Calculate word-level stats for changed lines
        let addedWords = 0, removedWords = 0, changedWords = 0;
        differences.forEach(diff => {
            if (diff.wordDiff) {
                addedWords += diff.wordDiff.filter(w => w.type === 'added').length;
                removedWords += diff.wordDiff.filter(w => w.type === 'removed').length;
            }
        });

        return { 
            added, 
            removed, 
            changed, 
            equal, 
            total: differences.length,
            addedWords,
            removedWords,
            changedWords: Math.max(addedWords, removedWords)
        };
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
        const content = `Advanced Text Compare Results - ${timestamp}\n\n` +
            `STATISTICS:\n` +
            `- Total lines: ${stats.total}\n` +
            `- Equal lines: ${stats.equal}\n` +
            `- Changed lines: ${stats.changed}\n` +
            `- Added lines: ${stats.added}\n` +
            `- Removed lines: ${stats.removed}\n` +
            `- Word changes: ${stats.changedWords}\n\n` +
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
        a.download = `advanced-text-comparison-${timestamp}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showSuccessToast('Comparison downloaded!');
    }, [leftText, rightText, differences, stats]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Advanced Text Compare
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Professional word-by-word text comparison tool with advanced diff algorithms. 
                        Compare texts with precision like Beyond Compare.
                    </p>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                    <ActionButton onClick={copyLeftToRight} icon={ArrowRight} disabled={!leftText}>
                        Copy Left → Right
                    </ActionButton>
                    <ActionButton onClick={copyRightToLeft} icon={ArrowLeft} disabled={!rightText}>
                        Copy Right → Left
                    </ActionButton>
                    <ActionButton onClick={downloadComparison} icon={Download} variant="secondary" disabled={!leftText && !rightText}>
                        Download Results
                    </ActionButton>
                    <ActionButton 
                        onClick={() => setShowWordDiff(!showWordDiff)} 
                        icon={Settings} 
                        variant="secondary"
                        className={showWordDiff ? 'bg-blue-100 text-blue-700' : ''}
                    >
                        Word-Level Diff: {showWordDiff ? 'ON' : 'OFF'}
                    </ActionButton>
                    <ActionButton onClick={clearAll} icon={Trash2} variant="danger" disabled={!leftText && !rightText}>
                        Clear All
                    </ActionButton>
                </div>

                {/* Text Input Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <TextArea
                            value={leftText}
                            onChange={setLeftText}
                            placeholder="Paste your first text here..."
                            label="Original Text"
                        />
                    </div>
                    <div className="space-y-4">
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
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-blue-500" />
                            Comparison Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
                            <div className="text-center p-4 bg-blue-100 rounded-xl">
                                <div className="text-2xl font-bold text-blue-700">{stats.changedWords}</div>
                                <div className="text-sm text-blue-600">Word Changes</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Differences Display */}
                {differences.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Detailed Comparison Results
                            {showWordDiff && (
                                <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    Word-level highlighting enabled
                                </span>
                            )}
                        </h3>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {differences.map((diff, index) => (
                                <EnhancedDiffLine key={index} diff={diff} index={index} showWordDiff={showWordDiff} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!leftText && !rightText && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-4">Ready for Advanced Text Comparison</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            Paste your texts above to see detailed word-by-word comparison with professional highlighting.
                        </p>
                        <div className="text-sm text-gray-500 space-y-2">
                            <p>✨ Word-level difference detection</p>
                            <p>🎯 Accurate change highlighting</p>
                            <p>📊 Comprehensive statistics</p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center py-8 mt-16 border-t border-gray-200">
                    <p className="text-gray-600 mb-2">
                        Advanced Text Compare Tool - Made with ❤️ using React & Tailwind CSS
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-500 transition-colors">
                            <Github className="w-6 h-6" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-500 transition-colors">
                            <Linkedin className="w-6 h-6" />
                        </a>
                    </div>
                </footer>
            </div>

            <SuccessToast message={toastMessage} show={showToast} onHide={hideToast} />

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}