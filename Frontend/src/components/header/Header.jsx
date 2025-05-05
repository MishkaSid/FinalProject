import classes from './header.module.css';

/**
 * Renders the header of the application, containing the company logo and
 * the logo of the Perets Taubenslagel school.
 *
 * @return {ReactElement} The header element.
 */
function Header() {
  return (
    <header>
      <img className={classes.logo} src="FinalProjectDemo\Frontend\src\assets\images\logoBeta.PNG" alt="logo" />
      <img className={classes.schoolLogo} src="https://www.pet.ac.il/images/logo.png" alt="logo" />
    </header>
  )
}

export default Header
