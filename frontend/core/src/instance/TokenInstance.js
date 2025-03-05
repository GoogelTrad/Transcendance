import axiosInstance from './AxiosInstance';
import React, { useState, useEffect } from 'react';

let currentToken = null;

export function setCurrentToken(token) {
    currentToken = token;
}

export function getCurrentToken() {
    return currentToken;
}

export function getUserInfo() {
    const fetchUserData = async () => {
        try {
            const response = await axiosInstance.get('/api/user/fetch_user_data');
            return response.data.payload; 
        } catch (error) {
            console.log('Erreur lors de la récupération des données utilisateur:', error);
            return null; 
        }
    };
    return fetchUserData();
}

export function getTokenInfo() {
    const fetchUserData = async () => {
        try {
            const response = await axiosInstance.get('/api/user/get_token');
            return response.data.token; 
        } catch (error) {
            console.log('Erreur lors de la récupération du token utilisateur:', error);
            return null; 
        }
    };
    return fetchUserData();
}

export function useUserInfo() {
    const [userInfo, setUserInfo] = useState(null);
    const [tokenUser, setToken] = useState("");

    useEffect(() => {
        const fetchUserInfo = async () => {
            const data = await getUserInfo();
            if (data) {
                setUserInfo(data);
            }
        };
        const fetchTokenUser = async () => {
            const data = await getTokenInfo();
            if (data)
            {
                setToken(data);
                setCurrentToken(data);
            }
        }
        fetchUserInfo();
        fetchTokenUser();
    }, []);

    return { userInfo, tokenUser };
}

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function clearToken() {
    localStorage.removeItem('token');
}