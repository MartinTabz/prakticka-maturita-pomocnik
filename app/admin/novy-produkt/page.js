"use client";

import axios from "axios";
import slugify from "slugify";
import { useState } from "react";

export default function NewProductPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [customSlug, setCustomSlug] = useState(false);
	const [description, setDescription] = useState("");
	const [stripeProduct, setStripeProduct] = useState("");

	const handleCreate = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setSuccess(false);
		setError("");

		try {
			const { data } = await axios.post("/api/admin/create-new-product", {
				name: name,
				slug: slug,
				product_id: stripeProduct,
				description: description,
			});
			if (data?.success) {
				setSuccess(true);
			} else {
				setError("Něco se pokazilo, zkuste to později!");
			}
		} catch (error) {
			setError(error.response.data.error);
		}

		setIsLoading(false);
	};

	return (
		<div>
			<h1>Nový produkt</h1>
			{error && (
				<div>
					<b>Chyba: </b>
					{error}
				</div>
			)}
			{success && <div>Úspěch</div>}
			<div>
				<label>Jméno</label>
				<input
					disabled={isLoading}
					type="text"
					onChange={(e) => {
						setName(e.target.value);
						if (!customSlug) {
							setSlug(slugify(e.target.value, { lower: true }));
						}
					}}
					value={name}
				/>
			</div>
			<div>
				<label>Slug</label>
				<div>
					<span>{process.env.NEXT_PUBLIC_DOMAIN}/produkt/</span>
					<input
						disabled={isLoading}
						type="text"
						onChange={(e) => {
							if (!customSlug) {
								setCustomSlug(true);
							}
							setSlug(slugify(e.target.value, { lower: true }));
						}}
						value={slug}
					/>
				</div>
			</div>
			<div>
				<label>Stripe Product ID</label>
				<input
					disabled={isLoading}
					type="text"
					onChange={(e) => setStripeProduct(e.target.value)}
					value={stripeProduct}
				/>
			</div>
			<div>
				<label>Description</label>
				<textarea
					disabled={isLoading}
					type="text"
					onChange={(e) => setDescription(e.target.value)}
					value={description}
				></textarea>
			</div>
			<div>
				<div>
					{isLoading ? (
						<span>Ukládá se</span>
					) : (
						<button disabled={isLoading} onClick={handleCreate}>
							Vytvořit
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
