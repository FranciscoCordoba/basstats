import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  limit?: number;
}

export const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  limit = 10,
}) => {
  if (totalPages <= 1 && totalItems <= limit) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-on-surface-variant border-t border-surface-container-highest">
      <div>
        <span>
          Mostrando página <strong className="text-on-surface">{currentPage}</strong> de{" "}
          <strong className="text-on-surface">{totalPages}</strong> ({totalItems} registros totales)
        </span>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg border border-surface-container-highest hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Página Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => {
          // Mostrar primera, última y una ventana alrededor de la página actual
          if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[34px] h-[34px] px-2 rounded-lg font-bold text-xs transition-colors ${
                  currentPage === p
                    ? "bg-primary text-white shadow-sm"
                    : "border border-surface-container-highest hover:bg-surface-container text-on-surface"
                }`}
              >
                {p}
              </button>
            );
          }
          if (p === currentPage - 2 || p === currentPage + 2) {
            return (
              <span key={p} className="px-1 text-on-surface-variant/50">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-surface-container-highest hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Página Siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
