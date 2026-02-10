import { useState, useEffect } from "react";
import { Button } from "./button";
import { Tag } from "./Tag";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (options: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selectedOptions,
  onSelectionChange,
  placeholder = "Выберите теги...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Фильтрация опций на основе поискового запроса
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleOptionClick = (option: string) => {
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    console.log("newSelected", newSelected);
    onSelectionChange(newSelected);
  };

  // Обработка кликов вне компонента для закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Проверяем, что клик был именно за пределами мультиселекта
      if (!target.closest(".multi-select")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative multi-select">
        {/* Кнопка триггера */}
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between h-10 px-3 py-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length === 0 ? (
            placeholder
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <Tag
                  key={option}
                  text={option}
                  variant="default"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick(option);
                  }}
                />
              ))}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {/* Список опций */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="p-2">
              {/* Поле поиска */}
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full p-2 mb-2 border rounded-md"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Список опций */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option}
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("handleOptionClick", option);
                        handleOptionClick(option);
                      }}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {selectedOptions.includes(option) && (
                          <Check className="h-4 w-4" />
                        )}
                      </span>
                      {option}
                    </div>
                  ))
                ) : (
                  <div className="py-1.5 text-center text-sm">
                    Нет вариантов
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
