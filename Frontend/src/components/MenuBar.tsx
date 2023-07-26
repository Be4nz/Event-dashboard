import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Divider, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { SignOutButton } from './SignOutButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useUserName } from './UserInfoProvider';

const MenuBar = styled(AppBar)`
  margin: 0;
  padding: 0;
  margin-bottom: 15px;
  box-shadow: none;
  background-color: rgb(60, 69, 71);
`;

const Logo = styled('img')`
  height: 110px;
  margin: 0 0 -4px -24px;
`;

const MenuButton = styled(Link)`
  text-decoration: none;
  color: inherit;
  padding: 0 20px;
  height: 110px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #363e40;
    cursor: pointer;
  }
`;

const LeftContainer = styled('div')`
  display: flex;
  align-items: center;
`;

const RightContainer = styled('div')`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const Text = styled(Typography)`
  margin-right: 15px;
  font-size: 20px;
`;

const NameText = styled(Typography)`
  font-size: 26px;
  font-weight: 300;
`;

const UserLogo = styled(AccountCircleIcon)`
  font-size: 40px;
  margin-right: 10px;
`;

export default function ButtonAppBar() {
  const { userName } = useUserName();
  return (
    <MenuBar position='static'>
      <Toolbar>
        <LeftContainer>
          <Link to={''}>
            <Logo src='/devBridgeLogo.png' alt='Logo' />
          </Link>
          <MenuButton to={'/events'}>
            <NameText>All Events</NameText>
          </MenuButton>
          <Divider orientation='vertical' flexItem />
          <MenuButton to={'/my-events'}>
            <NameText>My Events</NameText>
          </MenuButton>
          <Divider orientation='vertical' flexItem />
        </LeftContainer>
        <RightContainer>
          <Text>{userName}</Text>
          <UserLogo fontSize='large' />
          <SignOutButton />
        </RightContainer>
      </Toolbar>
    </MenuBar>
  );
}
