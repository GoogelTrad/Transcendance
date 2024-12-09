import "./Profile.css"
import { getCookies } from "../App"
import { useNavigate } from "react-router-dom"
import React, {useEffect, useState} from "react";
import { jwtDecode } from "jwt-decode";
import Button from 'react-bootstrap/Button';
import axiosInstance from "../instance/AxiosInstance";

function ChangeDetails({setUser, setValue, toChange})
{
	const navigate = useNavigate();
	const token = getCookies('token')
	const user = jwtDecode(token);
	const [detail, setDetails] = useState('');

	const handleChange = (e) => {
		const { value } = e.target;
		setDetails(value);
	  };

	const handleSubmit = async (e) =>
	{
        e.preventDefault();
        try 
        {
			const reponse = await axiosInstance.patch(`api/user/${user.id}`, {
				[toChange] : detail
			})
			setValue(false);
			setUser(reponse.data);
        } 
        catch (error)
        {
            console.error(error);
        }
	}
	return (
		<>
			<div>
			<form className='userchange-form' onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor={toChange}>Change here</label>
                        <input className='input-form'
                            type='text'
                            id={toChange}
                            name={toChange}
                            value={detail}
                            onChange={handleChange}
                            required$
                            placeholder='modify your details here'>    
                        </input>
                    </div>
					<Button type="submit" className='btn rounded'>Change</Button>
                </form>
			</div>
		</>
	)
}

function Profile()
{
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [showChangeUsername, setShowChangeUsername] = useState(false);
	const [showChangePassword, setShowChangePassword] = useState(false);
	const [showChangeImage, setShowChangeImage] = useState(false)
	const token = getCookies('token');
	const decodeToken = jwtDecode(token);

    const handleFileChange = async (e) => {
		e.preventDefault();
		const selectedImage = e.target.files[0];
		
		try {
			const response = await axiosInstance.patch(`api/user/${decodeToken.id}`, { 
				'profile_image' : selectedImage 
				}, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			setUser(response.data);
			console.log(user.profile_image)
		} 
		catch (error) {
			console.error("Error uploading profile image:", error);
		}
	};

	const fetchUserData = async () => 
	{
		try 
		{
			if (token)
			{
				const reponse = await axiosInstance.get(`api/user/${decodeToken.id}`);
				setUser(reponse.data);
			}
		}
		catch (error)
		{
			console.error('Erreur lors de la récupération des données utilisateur', error);
		}
	}

    useEffect (() => 
    {
        fetchUserData();
    }, [setUser]);

	return (
		<>
			{user ? (
				<div className="profile">
					<div className="profile-container">
						<label htmlFor="profile_image">
							<img
								src={user.profile_image ? `http://localhost:8000${user.profile_image}` : '/default.png'}
								alt="Profile"
								className="profile-picture"
								style={{ width: '100px', height: '100px', borderRadius: '50%', cursor: 'pointer',}}
							/>
							<input
								type="file"
								id="profile_image"
								accept="image/*"
								style={{ display: 'none' }}
								onChange={(e) => handleFileChange(e)}
							/>
						</label>
						<p>Nom : {user.name}</p>
						{!(showChangeUsername) ? (
							<Button className='btn rounded' onClick={() => setShowChangeUsername(true)}>Change Username</Button>
						) : (
							<>
								<ChangeDetails setUser={setUser} setValue={setShowChangeUsername} toChange={'name'}/>
								<Button className='btn rounded' onClick={() => setShowChangeUsername(false)}>Cancel</Button>
							</>
						)}
						<p>Email : {user.email}</p>
						{!(showChangePassword) ? (
							<Button className='btn rounded' onClick={() => setShowChangePassword(true)}>Change Pass</Button>
						) : (
							<>
								<ChangeDetails setUser={setUser} setValue={setShowChangePassword} toChange={'password'}/>
								<Button className='btn rounded' onClick={() => setShowChangePassword(false)}>Cancel</Button>
							</>
						)}
					</div>
				</div>
			) : (
				<p>Aucun utilisateur trouvé.</p>
			)}
		</>
	);
}

export default Profile;