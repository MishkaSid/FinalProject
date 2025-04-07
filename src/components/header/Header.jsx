import classes from './header.module.css';

function Header() {
  return (
    <header>
      <img className={classes.logo} src="src\images\logoBeta.PNG" alt="logo" />
      <img className={classes.schoolLogo} src="https://www.pet.ac.il/images/logo.png" alt="logo" />
    </header>
  )
}

export default Header
