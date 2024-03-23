"use client";

import { useState } from "react";
import axios from "axios";
import slugify from "slugify";
import Image from "next/image";

export default function NewSubjectComponent({ rawProducts }) {
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const [products, setProducts] = useState(rawProducts);
	const [productsOpened, setProductsOpened] = useState(false);
	const [chosenProduct, setChosenProduct] = useState(null);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [slug, setSlug] = useState("");
	const [customSlug, setCustomSlug] = useState(false);
	const [imageSrc, setImageSrc] = useState("");
	const [imageFile, setImageFile] = useState("");

	const onChangeUploadFile = async (event) => {
		try {
			if (!event.target.files || event.target.files.length === 0) {
				setError("Musíte vybrat obrázek k nahrání.");
				return;
			}
			const file = event.target.files[0];
			if (file.size > 2000000) {
				setError("Obrázek je příliš velký");
				return;
			}
			setImageFile(file);
			setImageSrc(URL.createObjectURL(file));
		} catch (error) {
			setError(error.message);
		}
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setIsLoading(true);

      const uploadData = new FormData();

      uploadData.set("name", name);
      uploadData.set("description", description);
      uploadData.set("image", imageFile);
      uploadData.set("product", chosenProduct?.id);
      uploadData.set("slug", slug);

		try {
			const { data } = await axios.post(
				"/api/admin/create-new-subject",
				uploadData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
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
			<div>
				<div>
					{error && (
						<div>
							<b>Chyba: </b>
							{error}
						</div>
					)}
					{success && <div>Úspěch</div>}
					<label>Produkt</label>
					<div>
						<div
							onClick={() => {
								if (products.length > 0 && isLoading == false) {
									setProductsOpened(!productsOpened);
								}
							}}
						>
							{products.length > 0
								? chosenProduct
									? chosenProduct.name
									: "Zvolte produkt"
								: "Nejprve musíte přidat produkt"}
						</div>
						{productsOpened && (
							<div>
								{products.map((product) => (
									<div
										onClick={() => {
											if (!isLoading) {
												setChosenProduct(product);
												setProductsOpened(false);
											}
										}}
										key={product.id}
									>
										{product.name}
									</div>
								))}
							</div>
						)}
					</div>
					<div>
						<label>Název</label>
						<input
							type="text"
							value={name}
							disabled={isLoading}
							onChange={(e) => {
								setName(e.target.value);
								if (!customSlug) {
									setSlug(slugify(e.target.value, { lower: true }));
								}
							}}
						/>
					</div>
					<div>
						<label>Slug</label>
						<div>
							{`${process.env.NEXT_PUBLIC_DOMAIN}/produkt/${
								chosenProduct?.slug ? chosenProduct.slug : "???"
							}/`}
							<input
								type="text"
								disabled={isLoading}
								value={slug}
								onChange={(e) => {
									if (!customSlug) {
										setCustomSlug(true);
									}
									setSlug(slugify(e.target.value, { lower: true }));
								}}
							/>
						</div>
					</div>
					<div>
						<label>Popis</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={isLoading}
						></textarea>
					</div>
					<div>
						<label>Obrázek</label>
						<input
							type="file"
							disabled={isLoading}
							accept="image/*"
							multiple={false}
							onChange={onChangeUploadFile}
						/>
					</div>
					<div>
						{imageSrc && (
							<Image width={400} height={200} src={imageSrc} alt="Obrázek" />
						)}
					</div>
					<div>
						{isLoading ? (
							<span>Ukládá se</span>
						) : (
							<button onClick={handleSave}>Uložit</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
