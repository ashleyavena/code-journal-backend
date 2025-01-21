import { Link, Outlet } from 'react-router-dom';
// import { UserContext } from './UserContext';
// import { useContext } from 'react';

export function NavBar() {
  // const { user } = useContext(UserContext)

  return (
    <>
      <header className="purple-background">
        <div className="container">
          <div className="row">
            <div className="column-full d-flex align-center">
              <h1 className="white-text">Code Journal</h1>
              <Link to="/" className="entries-link white-text">
                <h3>Entries</h3>
              </Link>
              <Link to="sign-in" className="entries-link white-text">
                <h3>Sign-in</h3>
              </Link>
              <Link to="sign-up" className="entries-link white-text">
                <h3>Sign-up</h3>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <Outlet />
    </>
  );
}
