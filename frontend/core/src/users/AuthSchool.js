import React from "react";
import { useEffect, useState } from "react";
import axiosInstance from "../instance/AxiosInstance";
import { useAuth } from './AuthContext';

export function HandleAuth() 
{
	window.open( `${process.env.REACT_APP_API_URL}/api/auth/code`, "42Auth", "width=600,height=800");
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
	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const { setIsAuthenticated, login } = useAuth();


	const handleVerify = async () => 	
	{
		try {
			const response = await axiosInstance.post('/api/user/code' , {code, name: name});
			if (response.status === 200) {
				setIsAuthenticated(true);
				localStorage.setItem('isAuthenticated', 'true');
            	window.close();
				login();
			}
		}
		catch(error) {
			console.log('error');
		}
	}

    useEffect(() => 
	{
        const urlParams = new URLSearchParams(window.location.search);
		const status = urlParams.get("status");
		setName(urlParams.get("name"));

		if (status === "2FA_REQUIRED" && isSchoolAuth === false)
			setIsSchoolAuth(true);
        else if (status === "SUCCESS") 
		{
            setIsAuthenticated(true);
			localStorage.setItem('isAuthenticated', 'true');
            window.close();
			login();
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

