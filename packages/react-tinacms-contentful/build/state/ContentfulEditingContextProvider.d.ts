import React from 'react';
import { TinaContentfulProviderProps } from '../providers/TinacmsContentfulProvider';
export interface ContentfulEditingProps extends Omit<TinaContentfulProviderProps, 'children'> {
    userAccessToken?: string;
}
export declare const ContentfulEditingContext: React.Context<ContentfulEditingProps | null>;
export declare const ContentfulEditingProvider: React.Provider<ContentfulEditingProps | null>;
export declare const ContentfulEditingConsumer: React.Consumer<ContentfulEditingProps | null>;
