export declare function ModalBuilder(modalProps: ModalBuilderProps): JSX.Element;
export declare const ErrorLabel: import("styled-components").StyledComponent<"p", any, {}, never>;
interface ModalBuilderProps {
    title: string;
    message: string;
    error?: string;
    actions: any[];
    close(): void;
}
export {};
