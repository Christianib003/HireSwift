import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../../constants/navigation';

const Navbar = () => {
  return (
    <nav className="sticky top-0 bg-background shadow-md py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center container-padding">
        <Link to="/" className="text-text text-2xl font-bold">
          HireSwift
        </Link>
        
        <div className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${
                link.isRegister ? 'bg-register text-primary pill-button' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 