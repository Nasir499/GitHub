import { useContext } from "react";
import { AuthContext } from "./AuthContextObject";

export const useAuth = () => {
    return useContext(AuthContext);
};
