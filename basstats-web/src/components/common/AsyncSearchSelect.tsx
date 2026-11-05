import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Check } from "lucide-react";

export interface AsyncSearchItem {
  id: number;
  title: string;
  subtitle?: string;
  badge?: string;
  image?: string | null;
}

interface AsyncSearchSelectProps {
  placeholder?: string;
  onSearch: (query: string) => Promise<AsyncSearchItem[]>;
  onSelect: (item: AsyncSearchItem) => void;
  selectedItem?: AsyncSearchItem | null;
  onClear?: () => void;
  label?: string;
}

export const AsyncSearchSelect: React.FC<AsyncSearchSelectProps> = ({
  placeholder = "Buscar jugador o equipo...",
  onSearch,
  onSelect,
  selectedItem,
  onClear,
  label,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AsyncSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Petición asíncrona con debounce
  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const items = await onSearch(query);
        setResults(items);
        setIsOpen(true);
      } catch (err) {
        console.error("Error en la búsqueda asíncrona:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms de espera (debounce)

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  // Cerrar el menú desplegable al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1.5">{label}</label>}

      {selectedItem ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-primary/40 bg-primary/5 text-on-surface">
          <div className="flex items-center space-x-3">
            {selectedItem.image && (
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-8 h-8 rounded-full object-cover border border-primary/20"
              />
            )}
            <div>
              <p className="text-sm font-bold">{selectedItem.title}</p>
              {selectedItem.subtitle && (
                <p className="text-xs text-on-surface-variant">{selectedItem.subtitle}</p>
              )}
            </div>
            {selectedItem.badge && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                {selectedItem.badge}
              </span>
            )}
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder={placeholder}
            className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-10 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all shadow-inner"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4" />}
          </div>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Floating Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-surface-container-high border border-surface-container-highest rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-surface-container-highest">
          {loading && results.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Buscando en el servidor...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-container-highest/60 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-8 h-8 rounded-full object-cover border border-primary/20 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                      {item.title.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    {item.subtitle && <p className="text-xs text-on-surface-variant">{item.subtitle}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      {item.badge}
                    </span>
                  )}
                  <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
