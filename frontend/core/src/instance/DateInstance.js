import React, { useState, useEffect } from 'react';

const LiveDateTime = () => {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const formatDateTime = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

		return { day, month, year, hours, minutes };
    };

    const { day, month, year, hours, minutes } = formatDateTime(dateTime);


    return (
		<>
			{hours}:{minutes}{"\n"}{day}/{month}/{year}
		</>
    );
};

export default LiveDateTime;
