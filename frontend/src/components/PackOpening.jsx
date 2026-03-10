import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PackOpening() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  return isOpen && (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-slate-800 rounded-xl p-8 w-96">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2">
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white mb-4">Pack Opening</h2>
          <div className="h-96 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center text-white text-3xl">📦</div>
          <button onClick={() => setIsOpen(false)} className="w-full mt-4 py-2 bg-purple-600 text-white rounded">Done</button>
        </div>
      </div>
    </>
  );
}
