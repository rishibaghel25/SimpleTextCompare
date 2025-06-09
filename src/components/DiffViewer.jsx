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
  Check
} from 'lucide-react';

// Utility function to calculate differences
export const calculateDiff = (text1, text2) => {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const maxLines = Math.max(lines1.length, lines2.length);
  const diff = [];

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || '';
    const line2 = lines2[i] || '';
    
    if (line1 === line2) {
      diff.push({ type: 'equal', content: line1, lineNumber: i + 1 });
    } else if (lines1[i] === undefined) {
      diff.push({ type: 'added', content: line2, lineNumber: i + 1 });
    } else if (lines2[i] === undefined) {
      diff.push({ type: 'removed', content: line1, lineNumber: i + 1 });
    } else {
      diff.push({ type: 'changed', content1: line1, content2: line2, lineNumber: i + 1 });
    }
  }
  
  return diff;
};

// Action Button Component
export const ActionButton = ({ onClick, icon: Icon, children, variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg";
  const variants = {
    primary: "button-gradient text-white hover:shadow-xl",
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
export const TextArea = ({ value, onChange, placeholder, label }) => (
  <div className="flex-1 flex flex-col">
    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      {label}
      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
        {value.split('\n').length} lines
      </span>
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-96 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md font-mono text-sm leading-relaxed"
      style={{ minHeight: '384px' }}
    />
  </div>
);

// Diff Line Component
export const DiffLine = ({ diff, index }) => {
  const getLineClass = (type) => {
    switch (type) {
      case 'added':
        return 'bg-green-100 border-l-4 border-green-500 text-green-800';
      case 'removed':
        return 'bg-red-100 border-l-4 border-red-500 text-red-800';
      case 'changed':
        return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800';
      default:
        return 'bg-gray-50 border-l-4 border-gray-300 text-gray-700';
    }
  };

  return (
    <div className={`p-3 mb-2 rounded-lg ${getLineClass(diff.type)} animate-slide-up font-mono text-sm`} style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start gap-4">
        <span className="text-xs font-bold opacity-60 min-w-[3rem]">
          Line {diff.lineNumber}
        </span>
        <div className="flex-1">
          {diff.type === 'changed' ? (
            <div className="space-y-2">
              <div className="bg-red-50 p-2 rounded border-l-2 border-red-300">
                <span className="text-xs font-semibold text-red-600 block mb-1">Original:</span>
                <span className="text-red-700">{diff.content1 || '(empty line)'}</span>
              </div>
              <div className="bg-green-50 p-2 rounded border-l-2 border-green-300">
                <span className="text-xs font-semibold text-green-600 block mb-1">Modified:</span>
                <span className="text-green-700">{diff.content2 || '(empty line)'}</span>
              </div>
            </div>
          ) : (
            <span>{diff.content || '(empty line)'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Success Toast Component
export const SuccessToast = ({ message, show, onHide }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce-subtle">
      <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2">
        <Check className="w-5 h-5" />
        {message}
      </div>
    </div>
  );
};
