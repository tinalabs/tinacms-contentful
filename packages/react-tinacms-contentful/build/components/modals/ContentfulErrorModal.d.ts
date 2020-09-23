export interface ContentfulAuthModalProps {
    error: Error;
    onClose(): void;
    onRetry(): void;
}
export declare function ContentfulErrorModal({ error, onClose, onRetry, }: ContentfulAuthModalProps): JSX.Element;
export default ContentfulErrorModal;
