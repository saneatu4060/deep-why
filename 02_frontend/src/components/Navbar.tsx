import { Link } from 'react-router-dom';

export const Navbar = () => {
    return (
        <header className="bg-white border-b border-gray-300">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link to="/" className="text-2xl font-serif font-bold text-gray-800 tracking-wide hover:opacity-80 transition-opacity">
                    Deep Why
                </Link>
                <nav className="flex gap-6">
                    <Link to="/history" className="text-sm font-serif font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        履歴
                    </Link>
                    <Link to="/settings" className="text-sm font-serif font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        設定
                    </Link>
                </nav>
            </div>
        </header>
    );
};