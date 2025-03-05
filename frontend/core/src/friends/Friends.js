import React, { useEffect, useState } from 'react';
import axiosInstance from '../instance/AxiosInstance';
import { jwtDecode } from 'jwt-decode';
import { showToast } from '../instance/ToastsInstance';
import { ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import ModalInstance from '../instance/ModalInstance';
import { useAuth } from '../users/AuthContext'; 
import Profile from '../users/Profile';
import "./Friends.css"

import { useTranslation } from 'react-i18next';

export function AddFriend({id})
{
	const { t } = useTranslation();

	const handleAddFriend = async (id) => {
		try {
			await axiosInstance.post(`/api/friends/send/${id}`);
			showToast('success', t('Toasts.FriendRequestSent'))
		} catch (error) {
			showToast("error", t(`Toasts.${error.response.data.error}`));
		}
	};

	return (
		<button 
			onClick={() => handleAddFriend(id)} 
			className="add-friend-btn"
		>
			➕ {t('AddFriend')}
		</button>
	)
}

function SeeFriendsRequest({ toWhom, type, onResponse }) {

	const { t } = useTranslation();

    const handleResponse = async () => {
        try {
            if (type) {
                await axiosInstance.post(`/api/friends/accept/${toWhom}`);
            } else {
                await axiosInstance.post(`/api/friends/decline/${toWhom}`);
            }
            onResponse(toWhom);
        } catch (error) {
			showToast("error", t(`Toasts.${error.response.data.error}`));
        }
    };

    return (
        <>
            <button 
                onClick={handleResponse} 
                style={{
                    marginRight: '10px', 
                    backgroundColor: type ? 'green' : 'red', 
                    color: 'white'
                }}
            >
                {type ? t('Accept') : t('Decline')}
            </button>
        </>
    );
}

function FriendRequests({setModal, setIsFriends, launching}) {
    
	const [friendRequests, setFriendRequests] = useState([]);
	const [friendList, setFriendList] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);

	const { t } = useTranslation();
	const { userInfo } = useAuth();

    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (query.length > 0) {
            try {
                const response = await axiosInstance.get(`/api/friends/search/${query}`);
                setSearchResults(response.data);
            } catch (error) {
				setSearchResults([])
            }
        } else {
            setSearchResults([]);
        }
    };

	const fetchFriendList = async () => {
		const decodeToken = userInfo;

		try {
			const reponse = await axiosInstance.get(`/api/friends/list/${decodeToken.id}`);
			setFriendList(reponse.data);
		}
		catch(error) {
			showToast("error", t(`Toasts.${error.response.data.error}`));
		}
	}

	const deleteFriend = async (id) => {

		try {
			const response = await axiosInstance.post(`/api/friends/delete/${id}`);
			setFriendList((prevList) => ({
				...prevList,
				friends: prevList.friends.filter((friend) => friend.id !== id),
			}));
			console.log(response.data.message);
			showToast("message", t(`Toasts.${response.data.message}`));
		}
		catch(error) {
			showToast("error", t(`Toasts.${error.response.data.error}`));
		}
	}

    const fetchFriendRequests = async () => {
        try {
            const response = await axiosInstance.get('/api/friends/request');
            setFriendRequests(response.data);
        } catch (error) {
            showToast("error", t(`Toasts.${error.response.data.error}`));
        }
    };

    const handleRequestResponse = (id) => {
        setFriendRequests((prevRequests) => prevRequests.filter((req) => req.id !== id));
		fetchFriendList();
    };

    useEffect(() => {
		if (userInfo)
		{
			fetchFriendList();
			fetchFriendRequests();
		}

		const interval = setInterval(() => {
			fetchFriendList();
        	fetchFriendRequests();
		}, 5000);
		
		return () => clearInterval(interval);
    }, []);

    return (
		<div className="general-friend">
		<div className="search-bar">
			<input
				type="text"
				placeholder={t('SearchFriends')}
				value={searchQuery}
				onChange={(e) => handleSearch(e.target.value)}
				style={{ padding: '5px', width: '100%' }}
			/>
		</div>

		<div className="friend-list">
			<p>{t('MyFriends')}</p>
			{friendList.friends && friendList.friends.length > 0 ? (
				<ul>
					{friendList.friends
						.filter(friend => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
						.map((friend) => (
							<li key={friend.id} className="friend-item">
								<img 
									src={friend.profile_image_url ? `${process.env.REACT_APP_API_URL}${friend.profile_image_url}` : '/default.png'}
									alt={`${friend.name}'s profile`} 
									className="friend-avatar"
									onClick={() => {
										launching({ newLaunch: "friend", setModal: setModal });
										setIsFriends(friend);
									}}
								/>
								<span className="friend-name">{friend.name}</span>
								<button
									onClick={() => deleteFriend(friend.id)}
									className="delete-friend-btn"
								>
									❌
								</button>
								<span> - {t('Status')}: {friend.status}</span>
								</li>
						))}
				</ul>
			) : (
				<p>{t('NoFriend')}</p>
			)}
		</div>


		<div className="search-results">
			<p>{t('SearchResults')}</p>
			{searchResults.length > 0 ? (
				<ul>
					{searchResults.map((user) => (
						<li key={user.id} className="search-user-item">
							<img 
								src={user.profile_image_url ? `${process.env.REACT_APP_API_URL}${user.profile_image_url}` : '/default.png'}
								alt={`${user.name}'s profile`} 
								className="friend-avatar"
								onClick={() => {
									launching({ newLaunch: "friend", setModal: setModal });
									setIsFriends(user);
								}}	
							/>
							<span className="friend-name">{user.name}</span>
							
							<AddFriend id={user.id}/>
						</li>
					))}
				</ul>
			) : (
				searchQuery.length > 0 && <p>{t('NoFriend')}</p>
			)}
		</div>

		<div className="friend-requests">
                <p>{t('FriendRequest')}</p>
                {friendRequests.length > 0 ? (
                    <ul>
                        {friendRequests.map((request) => (
                            <li key={request.id} className="request-item">
                                {request.from_user_name} ({request.from_user_email})
                                <span> - {t("SendOn")} {new Date(request.created_at).toLocaleDateString()}</span>
                                <div>
                                    <SeeFriendsRequest 
                                        toWhom={request.id} 
                                        type={true} 
                                        onResponse={handleRequestResponse} 
                                    />
                                    <SeeFriendsRequest 
                                        toWhom={request.id} 
                                        type={false} 
                                        onResponse={handleRequestResponse} 
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>{t('NoPending')}</p>
                )}
            </div>

		<ToastContainer />
	</div>
	);
}

export default FriendRequests;
