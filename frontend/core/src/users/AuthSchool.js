import React from "react";
import { useEffect, useState } from "react";
import axiosInstance from "../instance/AxiosInstance";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getCookies } from "../App";

export function HandleAuth() 
{
	const popup = window.open("http://localhost:8000/auth/code", "42Auth", "width=600,height=800");
	
	console.log(popup.opener);

	if (popup) 
		console.log("✅ window.opener défini manuellement !");
	else
		alert("Veuillez autoriser les pop-ups !");
};


export default function AuthSchool() 
{
    return (
		<>
			<button 
				type="button" 
				className='submit-button btn btn-primary' 
				onClick={HandleAuth}
			>
				42
			</button>
		</>
    );
}


export function AuthSuccess() 
{
	const [isSchoolAuth, setIsSchoolAuth] = useState(false);
	const [isPop, setIsPop] = useState(false);
	const [code, setCode] = useState("");
	const {isAuthenticated, setIsAuthenticated} = useAuth();
	const [name, setName] = useState("");


	const handleVerify = async () => 	
	{
		try {
			const response = await axiosInstance.post('/api/code' , {code, name: name});
			if (response.status === 200) {
				const authChannel = new BroadcastChannel("auth_channel");
				const token = getCookies('token');
				authChannel.postMessage({ token });
           	 	authChannel.close();
            	window.close();
			}
		}
		catch(error) {
			console.log('error');
		}
	}

    useEffect(() => 
	{
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
		const status = urlParams.get("status");
		setName(urlParams.get("name"));

		if (status === "2FA_REQUIRED" && isSchoolAuth === false)
			setIsSchoolAuth(true);
        else if (token && status !== "2FA_REQUIRED") 
		{
            const authChannel = new BroadcastChannel("auth_channel");
            authChannel.postMessage({ token });
            authChannel.close();
            window.close();
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

