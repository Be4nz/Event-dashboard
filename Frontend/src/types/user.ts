export interface User {
  id: string;
  displayName: string;
  email?: string;
}

export interface UserGroup {
  id: string;
  displayName: string;
  users: User[];
}

export type ShareListProp = User | UserGroup;
