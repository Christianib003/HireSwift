import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="sticky top-0 bg-background shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-text text-2xl font-bold">
          HireSwift
        </Link>
        
        <div className="flex items-center gap-8">
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/resources" className="nav-link">Resources</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/login" className="nav-link">Login</Link>
          <Link 
            to="/register" 
            className="nav-link bg-register text-primary pill-button"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 