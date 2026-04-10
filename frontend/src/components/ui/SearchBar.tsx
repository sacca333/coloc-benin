'use client';
import { useState } from 'react';
import clsx from 'clsx';

const CHIPS = [
  { key: 'ville', label: '📍 Ville' },
  { key: 'type', label: '🏠 Type' },
  { key: 'budget', label: '💰 Budget' },
  { key: 'equipements', label: '✨ Equipements' },
];

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
}

export function SearchBar({ onSearch, onFilterChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const handleChip = (key: string) => {
    const next = activeChip === key ? null : key;
    setActiveChip(next);
    onFilterChange?.(next || '');
  };

  return (
    <div className="w-full space-y-3">
      {/* Barre de recherche */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300"
        style={{
          background: focused ? '#fff' : '#F5F4FF',
          boxShadow: focused
            ? '0 0 0 2px #7B61FF, 0 4px 20px rgba(123, 97, 255, 0.15)'
            : '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Icone recherche */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={focused ? '#7B61FF' : '#9CA3AF'}
          strokeWidth={2}
          className="w-5 h-5 flex-shrink-0 transition-colors duration-200"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Rechercher dans les annonces..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 font-medium"
        />

        {/* Bouton clear */}
        {query && (
          <button
            onClick={() => { setQuery(''); onSearch?.(''); }}
            className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Chips filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        {CHIPS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleChip(key)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 border',
              activeChip === key
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'
            )}
            style={activeChip === key ? {
              background: 'linear-gradient(135deg, #7B61FF 0%, #9B85FF 100%)',
              boxShadow: '0 2px 8px rgba(123, 97, 255, 0.3)',
            } : {}}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
