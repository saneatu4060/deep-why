interface StatCardProps {
    title: string;
    value: string | number;
}

export const StatCard = ({ title, value }: StatCardProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-300 rounded-lg shadow-sm font-serif">
            <h3 className="text-xs text-gray-500 font-medium mb-1">{title}</h3>
            <p className={`font-bold text-gray-800 ${typeof value === 'string' && value.length > 5 ? 'text-sm' : 'text-2xl'}`}>
                {value}
            </p>
        </div>
    );
};