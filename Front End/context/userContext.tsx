import React, { createContext, useState } from 'react';

export type UserContextType = {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  userType: 'Student' | 'Staff' | null;
  setUserType: React.Dispatch<React.SetStateAction<'Student' | 'Staff' | null>>;
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
    season_parking_type: 'nil',
    capped_pass:false,
    profile_uri: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
  });

  const [loggedIn, setLoggedIn] = useState(false);

  const logout = () => {
    setUser({
      staff: false,
      season_parking: false,
      season_parking_type: 'nil',
      capped_pass:false,
      profile_uri: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
    });
    setLoggedIn(false);
  };
  
  const [userType, setUserType] = useState<'Student' | 'Staff' | null>(null);
  
  const value = {
    user,
    setUser,
    loggedIn,
    setLoggedIn,
    userType,
    setUserType,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};