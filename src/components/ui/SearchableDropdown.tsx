// src/components/SearchableDropdown.tsx
"use client";

import React, { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchableDropdownProps {
  options: string[];
  placeholder: string;
}

const SearchableDropdown = ({ options, placeholder }: SearchableDropdownProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative">
        <Combobox.Input
          className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-accent outline-none"
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Combobox.Button className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search size={20} className="text-gray-400" />
        </Combobox.Button>
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown size={20} className="text-gray-400" />
        </Combobox.Button>
        
        <Combobox.Options className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white rounded-md shadow-lg py-1">
          {filteredOptions.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
              Nothing found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <Combobox.Option
                key={option}
                value={option}
                className={({ active }) => `relative cursor-pointer select-none py-2 px-4 ${active ? 'bg-cream text-charcoal' : 'text-gray-900'}`}
              >
                {option}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export default SearchableDropdown;