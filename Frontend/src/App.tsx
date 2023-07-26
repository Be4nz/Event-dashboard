import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import MenuBar from './components/MenuBar';
import EditEvent from './pages/EditEvent';
import { ToastContainer } from 'react-toastify';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from '@azure/msal-react';
import { SignInButton } from './components/SignInButton';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/lt';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/pl';
import 'dayjs/locale/en';
import { Container } from './components/styled/Containers';
import './App.css';
import { UserRoleProvider } from './components/UserRolesProvider';
import { Events } from './components/Events';
import { MyEvents } from './components/MyEvents';
import { UserInfoProvider } from './components/UserInfoProvider';

const App = () => {
  return (
    <Container>
      <AuthenticatedTemplate>
        <UserInfoProvider>
          <UserRoleProvider>
            <Router>
              <ToastContainer />
              <MenuBar />
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={navigator.language.toLocaleLowerCase()}
              >
                <Routes>
                  <Route path='/events' element={<Events />} />
                  <Route path='/event' element={<CreateEvent />} />
                  <Route path='/my-events' element={<MyEvents />} />
                  <Route path='/event/:id' element={<EditEvent />} />
                  <Route path='/events/:id' element={<EventDetails />} />
                  <Route path='*' element={<Navigate to='/events' replace />} />
                </Routes>
              </LocalizationProvider>
            </Router>
          </UserRoleProvider>
        </UserInfoProvider>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <SignInButton />
      </UnauthenticatedTemplate>
    </Container>
  );
};
export default App;
