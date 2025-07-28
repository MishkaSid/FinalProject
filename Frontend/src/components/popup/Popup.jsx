import styles from './popup.module.css';

/**
 * A responsive popup component that conditionally renders a header, text, or custom content.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.header] - The header text to display.
 * @param {string} [props.text] - The main text to display.
 * @param {boolean} props.isOpen - Whether the popup is open.
 * @param {function} props.onClose - Function to close the popup.
 * @param {React.ReactNode} [props.children] - Optional custom content.
 *
 * @returns {JSX.Element|null} The rendered popup component or null if not open.
 */
const Popup = ({ header, text, isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        {header && <h2 className={styles.popupHeader}>{header}</h2>}
        {text && <p className={styles.popupText}>{text}</p>}
        {children}
        <button className={styles.closeButton} onClick={onClose}>
          ❌
        </button>
      </div>
    </div>
  );
};

export default Popup;
