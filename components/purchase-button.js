"use client";

import axios from "axios";
import style from "@styles/allproducts.module.css";
import { useRouter } from "next/navigation";

export default function PurchaseButton({ price }) {
	const router = useRouter();

	const handlePurchase = async () => {
		try {
			const { data } = await axios.post("/api/create-stripe-checkout", {
				price: price,
			});
			if (data?.url) {
				router.push(data.url);
			} else {
				console.log("Něco se pokazilo");
			}
		} catch (error) {
			console.log(error.response.data);
		}
	};
	return <button className={style.buy} onClick={handlePurchase}>Koupit</button>;
}
