import { useState, useEffect, useCallback } from 'react';
import { fetchItems, createItem, deleteItem, updateItem } from '../api/testCrudApi';

export const useTestCrud = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load data
    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchItems();
            setItems(data);
            setError(null);
        } catch (err) {
            setError('Failed to load items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // Add Item
    const addItem = async (itemData) => {
        try {
            await createItem(itemData);
            await loadItems(); // Refresh list to get new ID
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Update Item (New Functionality)
    const editItem = async (id, itemData) => {
        try {
            // Optimistic update (optional, helps UI feel snappy)
            setItems(prev => prev.map(item => 
                item.id === id ? { ...item, ...itemData } : item
            ));
            
            await updateItem(id, itemData);
            await loadItems(); // Ensure sync with server
            return { success: true };
        } catch (err) {
            loadItems(); // Revert on error
            return { success: false, error: err.message };
        }
    };

    // Remove Item
    const removeItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await deleteItem(id);
            setItems(prev => prev.filter(item => item.id !== id)); // Optimistic update
        } catch (err) {
            console.error(err);
            loadItems(); // Revert on error
        }
    };

    return { items, loading, error, addItem, editItem, removeItem, refresh: loadItems };
};