"use client";

import axios from "axios";
import style from "@styles/allproducts.module.css";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import { useNotifications } from "@utils/notificationcontext";
import { useState } from "react";

export default function PurchaseButton({ price }) {
	const router = useRouter();
	const { newError } = useNotifications();
	const [isLoading, setIsLoading] = useState(false);

	const handlePurchase = async () => {
		setIsLoading(true);
		try {
			const { data } = await axios.post("/api/create-stripe-checkout", {
				price: price,
			});
			if (data?.url) {
				router.push(data.url);
			} else {
				newError(data?.error);
			}
		} catch (error) {
			console.log(error.response.data);
			newError(error.response.data.error);
		}
		setIsLoading(false);
	};
	return (
		<button disabled={isLoading} className={style.buy} onClick={handlePurchase}>
			{isLoading ? (
				<FiLoader style={{ fontSize: "1.5rem" }} className={`loader`} />
			) : (
				"Koupit"
			)}
		</button>
	);
}
