import React from "react";
import { useEffect, useState } from "react";
import axiosInstance from "../instance/AxiosInstance";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function AuthSchool() {
	const [isSchoolAuth, setIsSchoolAuth] = useState(false);
	const [isPop, setIsPop] = useState(false);
	const {isAuthenticated, setIsAuthenticated} = useAuth();
	const [code, setCode] = useState("");
	const [name, setName] = useState("");

    const handleAuth = () => {
        const popup = window.open("http://localhost:8000/auth/code", "42Auth", "width=600,height=800", "noopener=false");
		
		if (popup) 
		{
			setIsPop(true);
			console.log("✅ window.opener défini manuellement !");
		}
		else
			alert("Veuillez autoriser les pop-ups !");
    };

	const handleVerify = async () => 
	{
		try {
			const response = await axiosInstance.post('/api/code' , {code, name: name});
			if (response.status === 200) {
				setIsAuthenticated(true);
				setIsSchoolAuth(false);
				console.log("coucou");
			}
		}
		catch(error) {
			console.log('error');
		}
	}

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const status = urlParams.get("status");
		const token = urlParams.get("token");
		setName(urlParams.get('name'));
	
		console.log("URL Params - Status:", status);
		console.log("URL Params - Token:", token);
		console.log("window.opener:", window.opener);
	
		// if (status === "2FA_REQUIRED")
		// 	setIsSchoolAuth(true);
		if (status === "SUCCESS" && token) {
			setIsAuthenticated(true);
			console.log("Préparation de postMessage...");
			console.log(window.parent);
			console.log(window.parent.location);

			window.parent?.postMessage(
				{ token },
				"http://localhost:3000"
			);
			console.log("Message envoyé !");
			// window.close();
		}
	}, []);

    return (
		<>
			<button 
				type="button" 
				className='submit-button btn btn-primary' 
				onClick={handleAuth}
			>
				42
			</button>


			{isSchoolAuth && isPop ? 
			(
				<div className="col-md-6 d-flex flex-column align-items-center justify-content-center border-end">
					<h2>Enter Confirmation Code</h2>
					<input
					type="text"
					placeholder="Confirmation Code"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					/>
					<button onClick={handleVerify}>Verify</button>
				</div>
			) : (null)}
		</>
    );
}

export function AuthSuccess() {

	const [isSchoolAuth, setIsSchoolAuth] = useState(false);
	const {isAuthenticated, setIsAuthenticated} = useAuth();
	const [code, setCode] = useState("");
	const [name, setName] = useState("");

	const navigate = useNavigate();
	
	const handleVerify = async () => 
	{
        try {
            const response = await axiosInstance.post('/api/code' , {code, name: name});
            if (response.status === 200) {
				setIsAuthenticated(true);
				setIsSchoolAuth(false);
				console.log("coucou");
            }
        }
        catch(error) {
            console.log('error');
        }
    }


	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const status = urlParams.get("status");
		const token = urlParams.get("token");
		setName(urlParams.get('name'));
	
		console.log("URL Params - Status:", status);
		console.log("URL Params - Token:", token);
		console.log("window.opener:", window.opener);
	
		// if (status === "2FA_REQUIRED")
		// 	setIsSchoolAuth(true);
		if (status === "SUCCESS" && token) {
			setIsAuthenticated(true);
			console.log("Préparation de postMessage...");
			console.log(window.parent);
			console.log(window.parent.location);

			window.parent?.postMessage(
				{ token },
				"http://localhost:3000"
			);
			console.log("Message envoyé !");
			// window.close();
		}
	}, []);
	
	
	return (
		<>
			{isSchoolAuth ? 
			(
				<div className="col-md-6 d-flex flex-column align-items-center justify-content-center border-end">
					<h2>Enter Confirmation Code</h2>
					<input
					type="text"
					placeholder="Confirmation Code"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					/>
					<button onClick={handleVerify}>Verify</button>
				</div>
			) : (null)}
		</>
	);
}

export default AuthSchool;

