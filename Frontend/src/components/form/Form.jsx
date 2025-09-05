import styles from "./form.module.css";

/**
 * @component Form
 * @description A reusable form component that dynamically generates input fields based on a provided array.
 * It handles form submission and supports different input types, including a special case for a 'Role' dropdown.
 * @param {object} props - The component props.
 * @param {Array<object>} props.inputs - An array of input objects to be rendered in the form. Each object should have properties like `label`, `name`, `value`, `onChange`, and `type`.
 * @param {Function} props.onSubmit - The function to be called when the form is submitted.
 * @returns {JSX.Element} The rendered form component.
 */
const Form = ({ inputs, onSubmit }) => {
  /**
   * @function handleSubmit
   * @description Prevents the default form submission behavior and calls the `onSubmit` prop function.
   * @param {React.SyntheticEvent} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {inputs.map((input, index) => (
        <div className={styles.inputContainer} key={index}>
          <label className={styles.label}>{input.label}</label>

          {input.name === "Role" ? (
            <select
              className={styles.input}
              name={input.name}
              value={input.value}
              onChange={input.onChange}
            >
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Examinee">Examinee</option>
            </select>
          ) : (
            <input
              className={styles.input}
              type={input.type}
              name={input.name}
              value={input.value}
              onChange={input.onChange}
            />
          )}
        </div>
      ))}
      <button className={styles.submitButton} type="submit">
        Submit
      </button>
    </form>
  );
};

export default Form;
