import React from "react";
import { useEffect, useState } from "react";
import axiosInstance from "../instance/AxiosInstance";

function AuthSchool() {
    const popup = window.open(
      "http://localhost:8000/auth/code",
      "42Auth",
      "width=600,height=800"
    );


    const receiveMessage = (event) => {
      if (event.origin !== "http://localhost:3000") return; // Sécurité

      const { status, token, email } = event.data;

      if (status === "2FA_REQUIRED") {
        popup.close();
      } else if (status === "SUCCESS" && token) {
        localStorage.setItem("token", token);
        popup.close();
      }

      window.removeEventListener("message", receiveMessage);
    };

    window.addEventListener("message", receiveMessage);
};


export function AuthSuccess({name}) {

	const [isSchoolAuth, setIsSchoolAuth] = useState(false);
	const [code, setCode] = useState("");
	

	const handleVerify = async () => {
        try {
            const response = await axiosInstance.post('/api/code' , {code, name: name});
            if (response.status === 200)
            {
                setIsAuthenticated(true);
                setModal(false);
                setTerminal(false);
                navigate('/home');
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
		const email = urlParams.get("email");
		
		if (status === "2FA_REQUIRED")
		{
			setisAuth(true);
		}
		else 
		{
			setisAuth(false);
			window.opener?.postMessage(
				{ status, token, email },
				"http://localhost:3000/home"
			);

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

export default AuthSchool;

