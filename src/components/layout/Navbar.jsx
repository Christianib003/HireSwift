import { Link } from 'react-router-dom';
import { PUBLIC_NAVIGATION } from '../../constants/navigation';

const Navbar = ({ isLoggedIn }) => {
  return (
    <nav className="sticky top-0 bg-background shadow-md py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center container-padding">
        <Link to="/" className="text-text text-2xl font-bold">
          HireSwift
        </Link>

        <div className="flex items-center gap-8">
          {PUBLIC_NAVIGATION.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link
                to="/register"
                className="nav-link bg-register text-primary pill-button"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 