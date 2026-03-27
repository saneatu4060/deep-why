export const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-300 mt-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center">
                <p className="text-xs text-gray-500 font-serif tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} Deep Why. Logical Thinking Training.
                </p>
            </div>
        </footer>
    );
};