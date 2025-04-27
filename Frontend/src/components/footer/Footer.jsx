import './footer.css'
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