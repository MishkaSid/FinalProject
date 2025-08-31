import classes from './header.module.css';

/**
 * Renders the header of the application, containing the company logo and
 * the logo of the Perets Taubenslagel school.
 *
 * @return {ReactElement} The header element.
 */
function Header() {
  const logo = new URL('../../assets/images/logoBeta.PNG', import.meta.url).href;
  return (
    <header>
      <img className={classes.logo} src={logo} alt="logo" />
      <img className={classes.schoolLogo} src="https://www.pet.ac.il/images/logo.png" alt="logo" />
    </header>
  )
}

export default Header
