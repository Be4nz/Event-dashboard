import React, { FC, PropsWithChildren } from 'react';
import { CircularProgress, styled } from '@mui/material';
import Message from './styled/Message';

const Loading = styled(CircularProgress)`
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  font-weight: bold;
  text-align: center;
`;

export interface LoadingWrapperProps {
  loading: boolean;
  error: boolean;
}

const LoadingWrapper: FC<PropsWithChildren<LoadingWrapperProps>> = ({
  children,
  loading,
  error,
}) => {
  if (loading) return <Loading />;
  else if (error)
    return (
      <Message>
        Error has occurred, please try again later. If problem persists, contact
        the system administrator.
      </Message>
    );
  return <>{children}</>;
};

export default LoadingWrapper;
