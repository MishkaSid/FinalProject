import styles from './popup.module.css';

/**
 * A responsive popup component that conditionally renders a header and text.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.header] - The header text to display.
 * @param {string} [props.text] - The main text to display.
 * @param {boolean} props.isOpen - Whether the popup is open.
 * @param {function} props.onClose - Function to close the popup.
 *
 * @returns {JSX.Element} The rendered popup component.
 */
const Popup = ({ header, text, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        {header && <h2 className={styles.popupHeader}>{header}</h2>}
        {text && <p className={styles.popupText}>{text}</p>}
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
