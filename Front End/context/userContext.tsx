import React, { createContext, useState } from 'react';

export type UserContextType = {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
};


// Create context with the correct type
export const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
  children: React.ReactElement;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserData>({
    staff: false,
    season_parking: false,
    season_parking_type: 'nil'
  });

  const [loggedIn, setLoggedIn] = useState(false);

  const logout = () => {
    setUser({
      staff: false,
      season_parking: false,
      season_parking_type: 'nil'
    });
    setLoggedIn(false);
  };

  const value = {
    user,
    setUser,
    loggedIn,
    setLoggedIn,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};