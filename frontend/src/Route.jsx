import React, { useEffect } from "react";
import { useNavigate, useRoutes, useLocation } from 'react-router-dom'

// Pages
import Dashboard from './components/dashboard/Dashboard.jsx'
import Profile from './components/user/Profile.jsx'
import Login from './components/auth/Login.jsx'
import Signup from './components/auth/Signup.jsx'
import CreateRepository from './components/repo/CreateRepository.jsx'
import RepoDetail from './components/repo/RepoDetail.jsx'
import IssueList from './components/issue/IssueList.jsx'
import IssueDetail from './components/issue/IssueDetail.jsx'
import CreateIssue from './components/issue/CreateIssue.jsx'

// AuthContext
import { useAuth } from "./Authcontext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem('userId');
        if (userIdFromStorage && !currentUser) {
            setCurrentUser(userIdFromStorage);
        }

        const publicPaths = ["/auth", "/signup"];

        if (!userIdFromStorage && !publicPaths.includes(location.pathname)) {
            navigate("/auth");
        }

        if (userIdFromStorage && publicPaths.includes(location.pathname)) {
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser, location.pathname]);

    let element = useRoutes([
        {
            path: "/",
            element: <Dashboard />
        },
        {
            path: "/auth",
            element: <Login />
        },
        {
            path: "/signup",
            element: <Signup />
        },
        {
            path: "/profile",
            element: <Profile />
        },
        {
            path: "/create",
            element: <CreateRepository />
        },
        {
            path: "/repo/:id",
            element: <RepoDetail />
        },
        {
            path: "/repo/:repoId/issues",
            element: <IssueList />
        },
        {
            path: "/repo/:repoId/issues/new",
            element: <CreateIssue />
        },
        {
            path: "/issue/:id",
            element: <IssueDetail />
        },
        {
            path: "*",
            element: <Dashboard />
        }
    ]);
    return element;
};

export default ProjectRoutes;