import { Link } from 'react-router-dom';

function Header({ user, onLogout }) {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        📋 Airtable Form Builder
                    </Link>

                    <nav className="nav">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="nav-link">
                                    Dashboard
                                </Link>
                                <Link to="/forms/new" className="nav-link">
                                    Create Form
                                </Link>
                                <span className="nav-link" style={{ cursor: 'default' }}>
                                    {user.profile?.email || 'User'}
                                </span>
                                <button onClick={onLogout} className="btn btn-secondary btn-sm">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="nav-link">
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;
