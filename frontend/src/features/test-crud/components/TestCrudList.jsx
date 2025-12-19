import React from 'react';

const TestCrudList = ({ items, onDelete, onEdit }) => {
    if (items.length === 0) return <p className="text-gray-500 text-center py-4">No items found.</p>;

    return (
        <ul className="space-y-3">
            {items.map((item) => (
                <li 
                    key={item.id} 
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="mb-3 sm:mb-0">
                        <strong className="text-gray-800 text-lg block">{item.title}</strong>
                        <p className="mt-1 text-gray-500 text-sm">{item.description}</p>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => onEdit(item)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => onDelete(item.id)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default TestCrudList;