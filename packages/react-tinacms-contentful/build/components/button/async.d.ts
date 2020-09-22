interface ButtonProps {
    name: string;
    action(): Promise<void>;
    primary: boolean;
}
export declare const AsyncButton: ({ name, primary, action }: ButtonProps) => JSX.Element;
export {};
