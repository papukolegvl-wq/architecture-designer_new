import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Zap, Box, Layers, MousePointer2, Plus } from 'lucide-react';
import { Node } from 'reactflow';
import { components } from './ComponentPalette';
import { ComponentType } from '../types';

interface SearchPanelProps {
    nodes: Node[];
    onSelectNode: (nodeId: string) => void;
    onAddComponent: (type: ComponentType, position?: { x: number; y: number }, label?: string) => void;
    onClose: () => void;
}

type SearchResult =
    | { type: 'node'; id: string; label: string; nodeType: string }
    | { type: 'palette'; componentType: ComponentType; label: string; icon: React.ReactNode; color: string };

const SearchPanel: React.FC<SearchPanelProps> = ({ nodes, onSelectNode, onAddComponent, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Функция нормализации для игнорирования различий между RU и UA раскладками
    const normalize = (str: string) => {
        return str.toLowerCase()
            .replace(/[иііїы]/g, 'и')
            .replace(/[еєэё]/g, 'е')
            .trim();
    };

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            return;
        }

        const q = normalize(query);

        // 1. Ищем по существующим узлам
        const nodeResults: SearchResult[] = nodes
            .filter(node => {
                const label = normalize(node.data?.label || '');
                const type = normalize(node.type || '');
                return label.includes(q) || type.includes(q);
            })
            .map(node => ({
                type: 'node',
                id: node.id,
                label: node.data?.label || 'Безымянный',
                nodeType: node.type || 'component'
            }));

        // 2. Ищем по доступным компонентам палитры
        const paletteResults: SearchResult[] = components
            .filter(c => {
                const label = normalize(c.label);
                const type = normalize(c.type);
                return label.includes(q) || type.includes(q);
            })
            .map(c => ({
                type: 'palette',
                componentType: c.type,
                label: c.label,
                icon: c.icon,
                color: c.color
            }));

        // Объединяем результаты: ПРИОРИТЕТ палитре (новым компонентам), чтобы не путать с существующими
        // Сначала идут совпадения по палитре, потом существующие узлы
        const allResults = [
            ...paletteResults.slice(0, 5),
            ...nodeResults.slice(0, 5)
        ].slice(0, 10);

        setResults(allResults);
        setSelectedIndex(0);
    }, [query, nodes]);

    const handleSelect = (result: SearchResult) => {
        if (result.type === 'node') {
            console.log('Navigating to node:', result.id);
            onSelectNode(result.id);
        } else {
            console.log('Adding component type:', result.componentType, 'with label:', result.label);
            if (typeof onAddComponent === 'function') {
                onAddComponent(result.componentType, undefined, result.label);
            } else {
                console.error('onAddComponent is not a function!', onAddComponent);
            }
        }
        onClose();
    };

    const listRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLDivElement>(null);

    // Автоматическая прокрутка к выбранному элементу
    useEffect(() => {
        if (selectedRef.current) {
            selectedRef.current.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [selectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowDown' && results.length > 0) {
            setSelectedIndex(prev => (prev + 1) % results.length);
            e.preventDefault();
        }
        if (e.key === 'ArrowUp' && results.length > 0) {
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            e.preventDefault();
        }
        if (e.key === 'Enter' && results.length > 0) {
            handleSelect(results[selectedIndex]);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '80px',
                right: '40px',
                width: '500px',
                backgroundColor: 'rgba(25, 25, 25, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                zIndex: 9999,
                padding: '8px',
                animation: 'searchFadeIn 0.2s ease-out'
            }}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
        >
            <style>{`
        @keyframes searchFadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .search-result-item {
          transition: all 0.2s;
        }
        .search-result-item.selected {
          background: rgba(77, 171, 247, 0.2);
          border-left: 4px solid #4dabf7;
        }
        .search-result-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>

            <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '12px' }}>
                <Search color="#4dabf7" size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск существующих или новых компонентов..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '18px',
                        outline: 'none',
                        flex: 1,
                        fontFamily: 'inherit'
                    }}
                />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#555', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>ESC</div>
                    <X
                        color="#888"
                        size={20}
                        style={{ cursor: 'pointer' }}
                        onClick={onClose}
                    />
                </div>
            </div>

            {results.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                    {results.map((result, index) => {
                        const showHeader = index === 0 || (result.type !== results[index - 1].type);
                        const headerTitle = result.type === 'palette' ? 'Добавить новый компонент' : 'Найти на карте';

                        return (
                            <React.Fragment key={result.type === 'node' ? `node-${result.id}` : `palette-${result.componentType}-${result.label}`}>
                                {showHeader && (
                                    <div style={{
                                        padding: '12px 12px 4px 12px',
                                        fontSize: '10px',
                                        color: '#555',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontWeight: 600
                                    }}>
                                        {headerTitle}
                                    </div>
                                )}
                                <div
                                    ref={index === selectedIndex ? selectedRef : null}
                                    className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                                    onClick={() => handleSelect(result)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        margin: '4px 8px'
                                    }}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: index === selectedIndex ? 'rgba(77, 171, 247, 0.2)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        color: result.type === 'palette' ? result.color : '#fff'
                                    }}>
                                        {result.type === 'node' ? (
                                            (result.nodeType === 'system' || result.nodeType === 'business-domain' ?
                                                <Layers size={16} /> : <Box size={16} />)
                                        ) : (
                                            result.icon
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{result.label}</div>
                                        <div style={{ color: '#888', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {result.type === 'node' ? `На карте (ID: ${result.id.slice(0, 8)}...)` : `Шаблон: ${result.componentType}`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {index === selectedIndex && (
                                            <div style={{ fontSize: '9px', color: '#4dabf7', background: 'rgba(77, 171, 247, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {result.type === 'node' ? <MousePointer2 size={10} /> : <Plus size={10} />}
                                                {result.type === 'node' ? 'Найти' : 'Добавить'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}

            {query.trim() !== '' && results.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{ color: '#555', fontSize: '14px' }}>Компоненты не найдены</div>
                    <div style={{ color: '#333', fontSize: '12px', marginTop: '4px' }}>Попробуйте другое название</div>
                </div>
            )}

            <div style={{
                padding: '12px',
                fontSize: '10px',
                color: '#444',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span><span style={{ color: '#666' }}>↑↓</span> Навигация</span>
                    <span><span style={{ color: '#666' }}>↵</span> Выбрать</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={10} color="#fab005" />
                    <span>Поиск по карте и палитре</span>
                </div>
            </div>
        </div>
    );
};

export default SearchPanel;
