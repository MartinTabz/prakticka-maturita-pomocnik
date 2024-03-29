"use client";

import { createContext, useContext, useState } from "react";
import { BiCheck, BiError } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import style from "@styles/notification.module.css";

const Context = createContext();

const Provider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);

	const newError = (info) => {
		if (info) {
			setNotifications((notifications) => [
				...notifications,
				{ message: info, error: true },
			]);
		}
	};

	const newSuccess = (info) => {
		if (info) {
			setNotifications((notifications) => [
				...notifications,
				{ message: info, error: false },
			]);
		}
	};

	const removeNotification = (index) => {
		const newNotifications = [...notifications];
		newNotifications.splice(index, 1);
		setNotifications(newNotifications);
	};

	const exposed = {
		newError,
		newSuccess,
		notifications,
		removeNotification,
	};

	return (
		<>
			<div className={style.area}>
				{notifications.map((notification, index) => (
					<div
						className={`${style.noti} ${
							notification.error ? style.error : style.success
						}`}
						key={index}
					>
						{notification.error ? <BiError /> : <BiCheck />}
						<p>{notification.message}</p>
						<span
							className={style.close}
							onClick={() => removeNotification(index)}
						>
							<IoClose />
						</span>
					</div>
				))}
			</div>
			<Context.Provider value={exposed}>{children}</Context.Provider>
		</>
	);
};

export const useNotifications = () => useContext(Context);

export default Provider;
