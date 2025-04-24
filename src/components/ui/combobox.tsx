"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "./badge";
import { motion, AnimatePresence } from "framer-motion";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: ComboboxOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  badgeClassName?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  emptyText = "No items found.",
  className,
  badgeClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !inputValue && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
    // Allow for adding custom skills by pressing Enter
    if (
      e.key === "Enter" &&
      inputValue &&
      !options.some((opt) => opt.value === inputValue)
    ) {
      const newValue = inputValue.trim();
      if (newValue && !selected.includes(newValue)) {
        onChange([...selected, newValue]);
        setInputValue("");
        e.preventDefault();
      }
    }
  };

  const selectedItems = selected.map((s) => ({
    value: s,
    label: options.find((o) => o.value === s)?.label || s,
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between px-3 py-2 h-auto min-h-10 font-normal",
            selected.length > 0 ? "h-auto" : "",
            className
          )}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1 w-full">
            {selectedItems.length > 0 ? (
              <AnimatePresence>
                {selectedItems.map((item) => (
                  <motion.div
                    key={item.value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Badge
                      variant="secondary"
                      className={cn("mr-1 mb-1 pr-0.5 pl-2", badgeClassName)}
                    >
                      {item.label}
                      <span
                        role="button"
                        tabIndex={0}
                        className="inline-flex h-5 w-5 items-center justify-center ml-1 hover:bg-secondary-foreground/20 rounded-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnselect(item.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleUnselect(item.value);
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[200px] p-0">
        <Command className="w-full" onKeyDown={handleKeyDown}>
          <CommandInput
            placeholder="Search..."
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {emptyText}{" "}
              {inputValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => {
                    const newValue = inputValue.trim();
                    if (newValue && !selected.includes(newValue)) {
                      onChange([...selected, newValue]);
                      setInputValue("");
                    }
                  }}
                >
                  + Add "{inputValue}"
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options
                .filter((option) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(
                          isSelected
                            ? selected.filter((value) => value !== option.value)
                            : [...selected, option.value]
                        );
                        setInputValue("");
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
