import {FileText, Sparkles} from "lucide-react";
import React from "react";

const Header = () => (
    <header className="text-center py-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">
                SimpleTextCompare
            </h1>
            <Sparkles className="w-6 h-6 text-primary-500 animate-pulse-slow" />
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Compare texts side by side with beautiful highlighting and powerful editing tools
        </p>
    </header>
);

export default Header; 