import classes from './header.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Renders the header of the application, containing the company logo and
 * the logo of the Perets Taubenslagel school.
 *
 * @return {ReactElement} The header element.
 */
function Header() {
  const logo = new URL('../../assets/images/logoBeta.PNG', import.meta.url).href;
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoClick = () => {
    // Navigate to user's home page based on role
    if (user?.role === 'Admin') {
      navigate('/manager');
    } else if (user?.role === 'Teacher') {
      navigate('/teacher');
    } else if (user?.role === 'Examinee') {
      navigate('/student');
    } else {
      navigate('/'); // Default to login page if no user
    }
  };

  const handleSchoolLogoClick = () => {
    // Open school website in new tab
    window.open('https://www.pet.ac.il/', '_blank');
  };

  return (
    <header>
      <img 
        className={classes.logo} 
        src={logo} 
        alt="logo" 
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />
      <img 
        className={classes.schoolLogo} 
        src="https://www.pet.ac.il/images/logo.png" 
        alt="school logo" 
        onClick={handleSchoolLogoClick}
        style={{ cursor: 'pointer' }}
      />
    </header>
  )
}

export default Header
