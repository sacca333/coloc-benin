'use client';
import { useState, useRef, useEffect } from 'react';

export function VilleAutocomplete({ value, onChange, villes, placeholder = 'Rechercher une ville...' }: {
    value: string;
    onChange: (v: string) => void;
    villes: string[];
    placeholder?: string;
}) {
    const [input, setInput] = useState(value || '');
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setInput(value || ''); }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const suggestions = input.trim()
        ? villes.filter(v => v.toLowerCase().includes(input.trim().toLowerCase()))
        : villes;

    const choisir = (ville: string) => {
        setInput(ville);
        onChange(ville);
        setOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                value={input}
                onChange={e => { setInput(e.target.value); onChange(e.target.value); setOpen(true); setHighlight(0); }}
                onFocus={() => setOpen(true)}
                onKeyDown={e => {
                    if (!open || suggestions.length === 0) return;
                    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, suggestions.length - 1)); }
                    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
                    else if (e.key === 'Enter') { e.preventDefault(); choisir(suggestions[highlight]); }
                    else if (e.key === 'Escape') setOpen(false);
                }}
                className="input"
                placeholder={placeholder}
                autoComplete="off"
            />
            {open && suggestions.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((v, i) => (
                        <li
                            key={v}
                            onMouseDown={() => choisir(v)}
                            onMouseEnter={() => setHighlight(i)}
                            className={`px-3 py-2 text-sm cursor-pointer ${i === highlight ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                        >
                            {v}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}