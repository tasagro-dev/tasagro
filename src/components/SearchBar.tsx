import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUbicaciones } from '@/hooks/useUbicaciones';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onProvinciaSuggestionSelect: (provincia: string) => void;
  onLocalidadSuggestionSelect: (localidad: string, provincia: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ 
  value, 
  onChange, 
  onProvinciaSuggestionSelect,
  onLocalidadSuggestionSelect,
  placeholder = "Buscar localidad o provincia" 
}: SearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{type: 'provincia' | 'localidad', value: string, provincia?: string}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { ubicaciones, provincias } = useUbicaciones();

  useEffect(() => {
    if (value.length >= 2) {
      const searchTerm = value.toLowerCase();
      
      // Buscar provincias
      const provinciaMatches = provincias
        .filter(p => p.toLowerCase().includes(searchTerm))
        .map(p => ({ type: 'provincia' as const, value: p }));

      // Buscar localidades
      const localidadMatches = ubicaciones
        .filter(u => u.localidad.toLowerCase().includes(searchTerm))
        .map(u => ({ type: 'localidad' as const, value: u.localidad, provincia: u.provincia }));

      setSuggestions([...provinciaMatches, ...localidadMatches].slice(0, 8));
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value, provincias, ubicaciones]);

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    if (suggestion.type === 'provincia') {
      onProvinciaSuggestionSelect(suggestion.value);
    } else {
      onLocalidadSuggestionSelect(suggestion.value, suggestion.provincia!);
    }
    setIsOpen(false);
  };

  const clearSearch = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 pr-12 h-14 text-lg border-2 border-border focus:border-primary rounded-full bg-background"
          onFocus={() => value.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 flex items-center gap-3"
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground">{suggestion.value}</div>
                {suggestion.type === 'localidad' && suggestion.provincia && (
                  <div className="text-sm text-muted-foreground">{suggestion.provincia}</div>
                )}
                <div className="text-xs text-muted-foreground capitalize">
                  {suggestion.type === 'provincia' ? 'Provincia' : 'Localidad'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};