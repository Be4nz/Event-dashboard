import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  PropsWithChildren,
} from 'react';
import { getCurrentUser } from '../auth/getAccessToken';
import LoadingWrapper from './LoadingWrapper';
import { getUserInfoFromOid } from '../api/users';

const UserInfoContext = createContext<{ userName: string }>({ userName: '' });

const UserInfoProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      getUserInfoFromOid(user.localAccountId)
        .then((data) => {
          setUserName(data.displayName);
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, []);

  const name = {
    userName: userName,
  };

  return (
    <UserInfoContext.Provider value={name}>
      <LoadingWrapper error={error} loading={loading}>
        {children}
      </LoadingWrapper>
    </UserInfoContext.Provider>
  );
};

function useUserName() {
  return useContext(UserInfoContext);
}

export { UserInfoProvider, useUserName };
