"use client";

import React, { useState } from "react";
import { Combobox } from "@headlessui/react";
import { Search, ChevronDown } from "lucide-react";
import { inputClass } from "./forms";
import { cn } from "@/shared/lib/cn";

interface SearchableDropdownProps {
  options: string[];
  placeholder: string;
}

const SearchableDropdown = ({ options, placeholder }: SearchableDropdownProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox value={selected} onChange={setSelected}>
      <div className="relative">
        <Combobox.Input
          className={cn(inputClass, "pl-10")}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Combobox.Button className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search size={20} className="text-muted-foreground" aria-hidden />
        </Combobox.Button>
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown size={20} className="text-muted-foreground" aria-hidden />
        </Combobox.Button>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card py-1 shadow-lg">
          {filteredOptions.length === 0 && query !== "" ? (
            <div className="relative cursor-default select-none px-4 py-2 text-muted-foreground">
              Nothing found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <Combobox.Option
                key={option}
                value={option}
                className={({ active }) =>
                  cn(
                    "relative cursor-pointer select-none px-4 py-2",
                    active ? "bg-primary/10 text-foreground" : "text-foreground"
                  )
                }
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
