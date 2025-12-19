import React from 'react';

const TestCrudLayout = ({ children }) => {
    return (
        <div className="max-w-3xl mx-auto p-6">
            <header className="mb-8 border-b-2 border-gray-100 pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Test CRUD Module</h1>
                <p className="text-gray-500 mt-1">Testing connection to FastAPI Backend</p>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};

export default TestCrudLayout;