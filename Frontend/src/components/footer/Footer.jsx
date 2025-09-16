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
      <a href="mailto:harshama@pet.ac.il">harshama@pet.ac.il</a>
      </div>  
      
      <div className="copyright">
      <p> {new Date().getFullYear()} all rights reserved &copy; Michael Sidoruk & Nadav Sayag  
      </p>
      </div>
    </footer>
  )
}

export default Footer