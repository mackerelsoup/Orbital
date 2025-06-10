import React, { createContext, useState } from 'react';

type UserContextType = {
  user:  UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
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
  });

  const value = {
    user,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};