import React from 'react';
interface LinkedSelectFieldProps {
    label?: string;
    name: string;
    component: string;
    initDisplay: string;
    getOptions: () => any;
}
interface LinkedFieldInputProps {
    name: string;
    value: any;
    onChange?: any;
}
export interface LinkedFieldProps {
    name: string;
    input: LinkedFieldInputProps;
    field: LinkedSelectFieldProps;
    tinaForm: any;
    disabled?: boolean;
}
export declare const ContentfulLinkedSelectField: React.FC<LinkedFieldProps>;
export {};
