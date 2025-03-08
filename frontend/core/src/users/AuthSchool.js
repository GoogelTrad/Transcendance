import React from "react";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "../instance/AxiosInstance";
import { useAuth } from './AuthContext';
import { showToast } from "../instance/ToastsInstance";
import { useNavigate } from 'react-router-dom';


export default function AuthSchool({ noButton })
{
    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/code`;
        }
        catch(error) {
            return "Error while trying to connect with 42."
        }
    }

	return noButton ? null : (
        <button
            type="button"
            className="submit-button btn btn-primary"
            onClick={handleAuth}
        >
            Connexion avec 42
        </button>
    );
}

export function AuthSuccess()
{
	const [name, setName] = useState("");
	const [isVerif, setIsVerif] = useState(false);
	const [code, setCode] = useState("");
	const { setIsAuthenticated, login } = useAuth();

	const navigate = useNavigate();

	const handleVerify = async () => 	
	{
		try {
			const response = await axiosInstance.post('/api/user/code' , {code, name: name});
			if (response.status === 200) {
				setIsAuthenticated(true);
				localStorage.setItem('isAuthenticated', 'true'); 
				login();
				navigate('/home');
			}
		}
		catch(error) {
			console.log('error');
		}
	}

	const handleStatus = () =>
	{
		const urlParams = new URLSearchParams(window.location.search);
		const status = urlParams.get("status");
		setName(urlParams.get("name"));

		console.log(status);
		if (status === "EMAIL_TAKEN")
		{
			showToast("error", "Email already taken!")
			navigate('/home');
		}
		else if (status === "ACCESS_DENIED")
		{
			showToast("error", "Access denied!")
			navigate('/home');
		}
		else if (status === "2FA_REQUIRED")
		{
			showToast("error", "Check email for 2FA code!")
			setIsVerif(true);
		}
		else if (status === "SUCCESS")
		{
			setIsAuthenticated(true);
			login();
			navigate('/home');
		}
	}

	useEffect(() => {
		handleStatus();
	}, []);

	return (
		<>
			{isVerif ? (
				<div className="col-md-6 d-flex flex-column align-items-center justify-content-center border-end">
					<h2>Enter Confirmation Code</h2>
					<input
						type="text"
						placeholder="Confirmation Code"
						value={code}
						onChange={(e) => setCode(e.target.value)}
					/>
					<button onClick={handleVerify}>Verify</button>
					<button onClick={() => navigate('/home')}>Cancel</button>

				</div>
			) : 
			<p>Redirection...</p>}
		</>
	)
}
