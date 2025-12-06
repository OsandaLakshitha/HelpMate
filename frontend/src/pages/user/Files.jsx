// src/pages/user/Files.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Folder, Upload, Download } from 'lucide-react';

const Files = () => {
  const files = [
    { name: 'Introduction to Algorithms.pdf', size: '2.4 MB', date: '2 days ago', type: 'pdf' },
    { name: 'Machine Learning Notes.docx', size: '1.8 MB', date: '5 days ago', type: 'doc' },
    { name: 'Data Structures Summary.pdf', size: '3.2 MB', date: '1 week ago', type: 'pdf' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Files</h1>
          <p className="text-slate-600">Manage your uploaded documents</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Modified</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {files.map((file, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium text-slate-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{file.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{file.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-1 hover:bg-teal-50 rounded text-teal-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Files;