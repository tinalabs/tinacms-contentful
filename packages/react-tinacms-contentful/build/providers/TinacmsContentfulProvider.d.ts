import React from 'react';
export interface TinaContentfulProviderProps {
    onLogin?: () => void;
    onLogout?: () => void;
    enabled: boolean;
    children: any;
}
export declare const TinaContentfulProvider: ({ enabled, onLogin, onLogout, children, }: TinaContentfulProviderProps) => JSX.Element;
export declare function useCMSEvent(event: string, callback: any, deps: React.DependencyList): void;
