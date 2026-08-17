import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, X, Leaf } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const BOTANICAL_EXAMPLES = [
  'Withania somnifera',
  'Curcuma longa',
  'Ginkgo biloba',
  'Rosmarinus officinalis',
  'Panax ginseng',
  'Cannabis sativa',
  'Matricaria chamomilla',
  'Salvia miltiorrhiza',
  'Echinacea purpurea',
  'Artemisia annua',
  'Camellia sinensis',
  'Zingiber officinale',
  'Bacopa monnieri',
  'Ocimum sanctum',
  'Rhodiola rosea',
  'Valeriana officinalis',
  'Glycyrrhiza glabra',
  'Hypericum perforatum',
  'Astragalus membranaceus',
  'Centella asiatica',
  'Nigella sativa',
  'Crocus sativus',
  'Coptis chinensis',
  'Silybum marianum',
];

// Exactly 3 botanical name examples
const QUICK_SEARCH_EXAMPLES = [
  { name: 'Rosmarinus officinalis', label: 'Rosemary' },
  { name: 'Curcuma longa', label: 'Turmeric' },
  { name: 'Ginkgo biloba', label: 'Ginkgo' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  isLoading,
}) => {
  const [inputVal, setInputVal] = useState(value);
  const [placeholderExample, setPlaceholderExample] = useState(() => {
    const idx1 = Math.floor(Math.random() * BOTANICAL_EXAMPLES.length);
    let idx2 = (idx1 + 1) % BOTANICAL_EXAMPLES.length;
    let idx3 = (idx1 + 2) % BOTANICAL_EXAMPLES.length;
    return `${BOTANICAL_EXAMPLES[idx1]}, ${BOTANICAL_EXAMPLES[idx2]}, ${BOTANICAL_EXAMPLES[idx3]}`;
  });

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  // Periodically cycle random botanical plant names for the placeholder without extra text
  useEffect(() => {
    const interval = setInterval(() => {
      const idx1 = Math.floor(Math.random() * BOTANICAL_EXAMPLES.length);
      let idx2 = Math.floor(Math.random() * BOTANICAL_EXAMPLES.length);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * BOTANICAL_EXAMPLES.length);
      }
      let idx3 = Math.floor(Math.random() * BOTANICAL_EXAMPLES.length);
      while (idx3 === idx1 || idx3 === idx2) {
        idx3 = Math.floor(Math.random() * BOTANICAL_EXAMPLES.length);
      }
      setPlaceholderExample(`${BOTANICAL_EXAMPLES[idx1]}, ${BOTANICAL_EXAMPLES[idx2]}, ${BOTANICAL_EXAMPLES[idx3]}`);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
            placeholder={placeholderExample}
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
                <span>Getting Data...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Get Data</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Quick Searches (3 examples) */}
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


