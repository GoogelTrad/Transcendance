import "./Profile.css"
import { useNavigate, Link, useParams } from "react-router-dom"
import React, {useEffect, useState} from "react";
import { jwtDecode } from "jwt-decode";
import Button from 'react-bootstrap/Button';
import axiosInstance from "../instance/AxiosInstance";
import edit from "../assets/user/edit.svg";
import x from "../assets/user/x.svg";
import check from "../assets/user/check.svg"
import gear from "../assets/user/gear.svg"
import { AddFriend } from "../friends/Friends"
import { showToast } from "../instance/ToastsInstance";
import { useAuth } from "./AuthContext";

import { useTranslation } from 'react-i18next';

function ChangeDetails({setUser, setValue, toChange, value, toType})
{
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { userInfo, refreshUserInfo } = useAuth();
	const user = userInfo
	const [detail, setDetails] = useState(value);

	const handleChange = (e) => {
		e.preventDefault();
		const { value } = e.target;
		setDetails(value);
	  };

	const handleSubmit = async (e) =>
	{
        e.preventDefault();
        try 
        {
			const reponse = await axiosInstance.patch(`/api/user/${user.id}`, {
				[toChange] : detail
			})
			setValue(false);
			setUser(reponse.data);
			await refreshUserInfo();
        } 
        catch (error)
        {
			if (error.status === 400)
				showToast('error', t('Toasts.UsernameAlreadyInUse'));
        }
	}
	return (
		<>
			<form className='userchange-form' onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "row", gap: "0.7rem"}}>
				<input className='input-form'
					type={toType}
					id={toChange}
					name={toChange}
					value={detail}
					onChange={handleChange}
					required
					placeholder={t('ModifyDetails')}/>
				<button type="submit" className='check-icon'><img src={check} alt="check"/></button>
            </form>
		</>
	) 
}

function Profile({id})
{

	const { t } = useTranslation();
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [showChangeUsername, setShowChangeUsername] = useState(false);
	const [showChangePassword, setShowChangePassword] = useState(false);
	const [showChangeImage, setShowChangeImage] = useState(false);
	const [editName, setEditName] = useState(false);
	const [isSettings, setIsSettings] = useState(false);
	const [isPermitted, setIsPermitted] = useState(false);
	const [isStud, setIsStud] = useState(false);
	const [is2fa, setIs2fa] = useState(false);
	const [friendList, setFriendList] = useState([]);
	const { userInfo, refreshUserInfo } = useAuth();
	let friends = friendList?.friends || [];

	const fetchFriendList = async () => {

		try {
			const reponse = await axiosInstance.get(`/api/friends/list/${id}`);
			setFriendList(reponse.data);
		}
		catch(error) {
			showToast("error", t('ToastsError'));
		}
	}

    const handleFileChange = async (e) => {
		e.preventDefault();
		const selectedImage = e.target.files[0];
		try {
			const response = await axiosInstance.patch(`/api/user/${id}`, { 
				'profile_image' : selectedImage 
				}, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			setUser(response.data);
			await refreshUserInfo();
		} 
		catch (error) {
			showToast("error", t(`Toasts.${error.response.data}`));
		}
	};

	const handleConfirm = async () =>
	{
		try {
			const response = await axiosInstance.post(`/api/user/perms/${id}`);
			setIs2fa(response.data.message === "EnableTo2FA" ? true : false);
			showToast("message", t(`Toasts.${response.data.message}`))
		}
		catch(error){
			showToast("error", t('Toasts.Error2FA'));
		}
	}

	const fetchUserData = async () => 
	{
		if (userInfo.id == id && userInfo.is_stud == false) {
			setIsStud(false);
			setIsPermitted(true);
		}
		else if (userInfo.id == id && userInfo.is_stud == true) {
			setIsStud(true);
			setIsPermitted(false);
		}
		else {
			setIsPermitted(false);
			setIsStud(false);
		}
		if (userInfo.id !== id)
		{
			if(id)
			{	
				try 
				{
					const reponse = await axiosInstance.get(`/api/user/${id}`);
					setUser(reponse.data);
				}
				catch (error)
				{
					showToast("error", t('ToastsError'));
				}
			}
		}
		else
			setUser(userInfo);
	}

    useEffect (() => 
    {
		if(id)
		{
			fetchUserData();
			fetchFriendList();
		}
		friends = friendList?.friends || [];
    }, [id]);

	useEffect(() => {}, [user]);

	return (
		<>
			{user ? (
				<div className="general-profile">
					<div className="user-general">
						<div className="profile-general">
							<label htmlFor="profile_image">
								<img
									src={user.profile_image_url ? `${process.env.REACT_APP_API_URL}${user.profile_image_url}` : '/default.png'}
									alt="Profile"
									className="profile-picture"
								/>
								{isPermitted && <input
									type="file"
									id="profile_image"
									accept="image/*"
									style={{ display: 'none' }}
									onChange={handleFileChange}
								/>}
							</label>

							<div className="general-change">
								<div className="change">
									{showChangeUsername ? 
										<ChangeDetails setUser={setUser} setValue={setShowChangeUsername} toChange={'name'} value={user.name} toType={'text'}/> 
										: 
										<div style={{ fontSize: "2rem" }}>{user.name}</div>}
									{isPermitted && !isStud && <button type="button" className="icon-change" onClick={() => setShowChangeUsername(!showChangeUsername)}>{showChangeUsername ? 
										<img src={x} alt="x"/>
										: 
										<img src={edit} alt="edit" className="edit-icon"/>}
										</button>}
								</div>
								{user.email && (
									<div>{user.email}</div> 
								)}
								{user.elo && (
									<div> ELO : {user.elo}</div> 
								)}
							</div>
						</div>

						{isPermitted || isStud ? (<div className="btn-group dropend">
							<button type="button" className="bouton-drop dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
								<img
									src={gear}
									alt='settings'
								/>
							</button>
							<ul className="dropdown-menu">
								<li><button className="dropdown-item" type="button" onClick={() => setShowChangePassword(true)}>{t('ChangePassword')}</button></li>
								<li><button className="dropdown-item" type="button" onClick={handleConfirm}>{is2fa ? t('Disable2FA') : t('Enable2FA')}</button></li>
							</ul>
							{showChangePassword && <ChangeDetails setUser={setUser} setValue={setShowChangePassword} toChange={'password'} value={null} toType={'password'}/>}
							{isPermitted && !isStud && showChangePassword && <img src={x} className="x-icon" alt="x" onClick={() => setShowChangePassword(false)}/>}
						</div>)
						:
						(
							<>
								{!friends.some(friend => friend.id === user.id) && (
									<div>
										<AddFriend id={user.id} />
									</div>
								)}
							</>
						)
						}
					</div>
				</div>
			) : (
				<p>{t('NoUsers')}</p>
			)}
		</>
	);
}

export default Profile;