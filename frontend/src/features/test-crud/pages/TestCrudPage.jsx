import React, { useState } from 'react';
import TestCrudLayout from '../layouts/TestCrudLayout';
import TestCrudForm from '../components/TestCrudForm';
import TestCrudList from '../components/TestCrudList';
import { useTestCrud } from '../hooks/useTestCrud';

const TestCrudPage = () => {
    const { items, loading, error, addItem, editItem, removeItem } = useTestCrud();
    
    // State to track which item is being edited (null means create mode)
    const [editingItem, setEditingItem] = useState(null);

    const handleFormSubmit = async (formData) => {
        if (editingItem) {
            // Update Logic
            const result = await editItem(editingItem.id, formData);
            if (result.success) {
                setEditingItem(null); // Return to "Add" mode
            }
        } else {
            // Create Logic
            await addItem(formData);
        }
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        // Optional: Scroll to top if list is long
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    return (
        <TestCrudLayout>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <TestCrudForm 
                onSubmit={handleFormSubmit} 
                itemToEdit={editingItem}
                onCancelEdit={handleCancelEdit}
            />
            
            {loading ? (
                <div className="flex justify-center p-8">
                    <p className="text-gray-500 animate-pulse">Loading data...</p>
                </div>
            ) : (
                <TestCrudList 
                    items={items} 
                    onDelete={removeItem} 
                    onEdit={handleEditClick}
                />
            )}
        </TestCrudLayout>
    );
};

export default TestCrudPage;