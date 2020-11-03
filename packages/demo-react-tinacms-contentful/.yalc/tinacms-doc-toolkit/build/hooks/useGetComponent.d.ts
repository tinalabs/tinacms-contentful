export declare const useLoadComponent: (loadComponent: () => Promise<any>) => {
    Component: any;
    loading: boolean;
    error: Error | undefined;
};
