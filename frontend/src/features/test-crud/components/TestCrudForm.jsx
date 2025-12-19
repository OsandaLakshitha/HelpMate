import { useState, useEffect } from 'react';

const TestCrudForm = ({ onSubmit, itemToEdit, onCancelEdit }) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    // Populate form if we are editing an item
    useEffect(() => {
        if (itemToEdit) {
            setTitle(itemToEdit.title);
            setDesc(itemToEdit.description || ''); // Handle potential null description
        } else {
            setTitle('');
            setDesc('');
        }
    }, [itemToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) return;
        
        // Pass data back to parent
        await onSubmit({ title, description: desc });

        // Only clear if not editing (or let parent handle clearing via itemToEdit prop)
        if (!itemToEdit) {
            setTitle('');
            setDesc('');
        }
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm"
        >
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
                {itemToEdit ? 'Update Item' : 'Add New Item'}
            </h3>
            
            <div className="flex flex-col md:flex-row gap-3">
                <input 
                    type="text" 
                    placeholder="Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    type="text" 
                    placeholder="Description" 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
                    className="flex-[2] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex gap-2">
                    <button 
                        type="submit" 
                        className={`px-4 py-2 text-white rounded transition-colors ${
                            itemToEdit 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {itemToEdit ? 'Update' : 'Add'}
                    </button>
                    
                    {itemToEdit && (
                        <button 
                            type="button"
                            onClick={onCancelEdit}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default TestCrudForm;