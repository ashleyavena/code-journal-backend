import { Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { EntryForm } from './pages/EntryForm';
import { EntryList } from './pages/EntryList';
import { NotFound } from './pages/NotFound';
import './App.css';
import { SignInForm } from './components/SignInForm';
import { RegistrationForm } from './components/RegistrationForm';
import { UserProvider } from './components/UserContext';

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<NavBar />}>
          <Route index element={<EntryList />} />
          <Route path="details/:entryId" element={<EntryForm />} />
          <Route path="*" element={<NotFound />} />
          <Route path="sign-in" element={<SignInForm />} />
          <Route path="sign-up" element={<RegistrationForm />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
