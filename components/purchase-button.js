"use client";

export default function PurchaseButton({ price }) {
	const handlePurchase = () => {
		console.log(price);
	};
	return <button onClick={handlePurchase}>Koupit</button>;
}
