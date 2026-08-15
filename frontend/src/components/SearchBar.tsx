import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, X, Leaf } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const QUICK_SEARCH_EXAMPLES = [
  { name: 'Rosmarinus officinalis', label: 'Rosemary' },
  { name: 'Curcuma longa', label: 'Turmeric' },
  { name: 'Ginkgo biloba', label: 'Ginkgo' },
  { name: 'Camellia sinensis', label: 'Green Tea' },
  { name: 'Echinacea purpurea', label: 'Echinacea' },
  { name: 'Zingiber officinale', label: 'Ginger' },
  { name: 'Withania somnifera', label: 'Ashwagandha' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  isLoading,
}) => {
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  const handleChipClick = (query: string) => {
    setInputVal(query);
    onChange(query);
    onSearch(query);
  };

  const handleClear = () => {
    setInputVal('');
    onChange('');
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', paddingLeft: '0.4rem' }}>
            <Leaf size={22} />
          </div>

          <input
            id="botanical-search-input"
            type="text"
            className="search-input"
            placeholder="Search botanical species or genus (e.g., Rosmarinus officinalis, Curcuma longa)..."
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              onChange(e.target.value);
            }}
            disabled={isLoading}
          />

          {inputVal && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                marginRight: '0.5rem',
              }}
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}

          <button
            id="botanical-search-button"
            type="submit"
            className="search-btn"
            disabled={isLoading || !inputVal.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Mining Literature...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Extract Pharmacology</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Quick Searches */}
      <div className="quick-queries">
        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Sparkles size={13} style={{ color: '#f59e0b' }} /> Examples:
        </span>
        {QUICK_SEARCH_EXAMPLES.map((item) => (
          <button
            key={item.name}
            type="button"
            className="quick-chip"
            onClick={() => handleChipClick(item.name)}
          >
            {item.name} <span style={{ opacity: 0.7, fontSize: '0.75rem', fontStyle: 'normal' }}>({item.label})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
