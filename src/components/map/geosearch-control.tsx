
"use client";

import { useState, useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, X } from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    boundingbox: [string, string, string, string];
}

export function GeosearchControl() {
    const map = useMap();
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 500);
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const search = async () => {
            if (debouncedQuery.length < 3) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    q: debouncedQuery,
                    format: 'json',
                    addressdetails: '1',
                    viewbox: '-92.23,17.82,-88.2,13.73',
                    bounded: '1',
                    limit: '5',
                });
                const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
                const data: NominatimResult[] = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Geosearch failed:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };
        search();
    }, [debouncedQuery]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
                setResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelectResult = (result: NominatimResult) => {
        const [south, north, west, east] = result.boundingbox;
        const bounds: L.LatLngBoundsExpression = [
            [parseFloat(south), parseFloat(west)],
            [parseFloat(north), parseFloat(east)],
        ];
        map.fitBounds(bounds);
        setQuery(result.display_name);
        setIsExpanded(false);
        setResults([]);
    };

    return (
        <div className="leaflet-top leaflet-left">
            <div ref={containerRef} className="leaflet-control geosearch-container">
                <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="shadow-lg"
                >
                    <Search className="h-5 w-5" />
                </Button>
                {isExpanded && (
                    <div className="relative flex items-center">
                        <Input
                            type="text"
                            placeholder="Buscar en Guatemala..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-64 shadow-lg"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                                query && <X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setQuery('')}/>
                            )}
                        </div>
                        {results.length > 0 && (
                            <div className="geosearch-results">
                                <ul>
                                    {results.map((result) => (
                                        <li key={result.place_id} onClick={() => handleSelectResult(result)}>
                                            {result.display_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
