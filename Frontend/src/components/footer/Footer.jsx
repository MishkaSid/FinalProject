// בקובץ זה נמצא רכיב התחתית של האפליקציה
// הקובץ מציג פרטי יצירת קשר וזכויות יוצרים
// הוא מספק מידע חשוב למשתמשים ומשמש כחלק מהפריסה הבסיסית
// Footer.js
import './footer.css'
/**
 * A simple footer component that displays a contact email and a copyright message
 * for the current year.
 * @returns {JSX.Element} The footer element.
 */
function Footer() {
  return(
     <footer>
      <div className="contact">
      <p>צרו קשר</p>
      <a href="https://www.pet.ac.il/%D7%A6%D7%95%D7%A8_%D7%A7%D7%A9%D7%A8">harshama@pet.ac.il</a>
      </div>  
      
      <div className="copyright">
      <p> {new Date().getFullYear()} all rights reserved &copy; Michael Sidoruk & Nadav Sayag  
      </p>
      </div>
    </footer>
  )
}

export default Footer