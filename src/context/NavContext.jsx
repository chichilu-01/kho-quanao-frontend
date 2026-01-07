import { createContext, useContext, useState } from "react";

const NavContext = createContext();

export const useNav = () => useContext(NavContext);

export const NavProvider = ({ children }) => {
  const [isNavVisible, setIsNavVisible] = useState(true);

  return (
    <NavContext.Provider value={{ isNavVisible, setIsNavVisible }}>
      {children}
    </NavContext.Provider>
  );
};
