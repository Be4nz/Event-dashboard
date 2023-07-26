import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  PropsWithChildren,
} from 'react';
import { getRoles } from '../api/users';
import LoadingWrapper from './LoadingWrapper';

const UserRoleContext = createContext<{ isAdmin: boolean }>({ isAdmin: false });

const UserRoleProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getRoles()
      .then((roles) => {
        setRoles(roles);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const isAdmin = {
    isAdmin: roles.indexOf('admin') !== -1,
  };

  return (
    <UserRoleContext.Provider value={isAdmin}>
      <LoadingWrapper error={error} loading={loading}>
        {children}
      </LoadingWrapper>
    </UserRoleContext.Provider>
  );
};

function useUserRole() {
  return useContext(UserRoleContext);
}

export { UserRoleProvider, useUserRole };
