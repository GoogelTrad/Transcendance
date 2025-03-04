import { Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../users/AuthContext';
import React, {useEffect, useState} from "react";


function ProtectedRoute({ children }) {
    const navigate = useNavigate();

    return children;
}

export default ProtectedRoute;
