"use client";

import { useState } from "react";
import { FiLoader } from "react-icons/fi";
import style from "@styles/upload.module.css";
import axios from "axios";
import { useNotifications } from "@utils/notificationcontext";
import { FaAngleDown } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export default function AssignProductComponent({ users, products }) {
	const [isLoading, setIsLoading] = useState(false);
	const { newError, newSuccess } = useNotifications();
	const router = useRouter();

	const [openedUserDropdown, setUserDropDown] = useState(false);
	const [openedProductDropdown, setProductDropDown] = useState(false);

	const [chosenUser, setChosenUser] = useState();
	const [chosenProduct, setChosenProduct] = useState();

	const handleSave = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setProductDropDown(false);
		setUserDropDown(false);

		if (!chosenProduct?.id || !chosenUser?.id) {
			newError("Musí být vybrány obě položky");
		} else {
			const { data } = await axios.post("/api/admin/assign-product", {
				product_id: chosenProduct.id,
				user_id: chosenUser.id,
			});
			if (data?.success) {
				newSuccess(data.success);
				router.push("/admin");
			} else if (data?.error) {
				newError(data.error);
			} else {
				newError("Něco se pokazilo, zkuste to později!");
			}
		}

		setIsLoading(false);
	};

	return (
		<section className={style.section}>
			<div className={style.area}>
				<h1>Přidat produkt uživateli</h1>
				<div
					className={style.dropdown}
					style={{
						borderRadius: openedUserDropdown ? "15px 15px 0 0" : "15px",
					}}
				>
					<div
						onClick={() => {
							if (!isLoading) {
								setUserDropDown(!openedUserDropdown);
							}
						}}
						className={style.dropdown_block}
					>
						<span>
							{users.length > 0
								? chosenUser
									? chosenUser.username
									: "Vybrat uživatele"
								: "Nejsou zatím registrovaní žádní uživatelé"}
						</span>
						<FaAngleDown
							style={{ transform: openedUserDropdown && "rotate(180deg)" }}
						/>
					</div>
					{openedUserDropdown && (
						<div
							style={{ padding: "15px 15px" }}
							className={style.dropdown_items}
						>
							{users.map((user, index) => (
								<div
									onClick={() => {
										setChosenUser(user);
										setUserDropDown(false);
									}}
									className={style.dropdown_item}
									key={index}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "30px",
										cursor: "pointer",
										marginBottom: index != users.length - 1 && "10px",
									}}
								>
									<h3>{user.username}</h3>
									{user.name && <span>{user.name}</span>}
									<span>{user.email}</span>
								</div>
							))}
						</div>
					)}
				</div>
				<div
					className={style.dropdown}
					style={{
						borderRadius: openedProductDropdown ? "15px 15px 0 0" : "15px",
					}}
				>
					<div
						onClick={() => {
							if (!isLoading) {
								setProductDropDown(!openedProductDropdown);
							}
						}}
						className={style.dropdown_block}
					>
						<span>
							{products.length > 0
								? chosenProduct
									? chosenProduct.name
									: "Vybrat produkt"
								: "Nejsou zatím žádné produkty"}
						</span>
						<FaAngleDown
							style={{ transform: openedProductDropdown && "rotate(180deg)" }}
						/>
					</div>
					{openedProductDropdown && (
						<div
							style={{ padding: "15px 15px" }}
							className={style.dropdown_items}
						>
							{products.map((product, index) => (
								<div
									onClick={() => {
										setChosenProduct(product);
										setProductDropDown(false);
									}}
									className={style.dropdown_item}
									key={index}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "30px",
										cursor: "pointer",
										marginBottom: index != users.length - 1 && "10px",
									}}
								>
									<h3>{product.name}</h3>
								</div>
							))}
						</div>
					)}
				</div>
				<div className={style.upload}>
					<div className={style.upload_btn}>
						{isLoading ? (
							<FiLoader color={"white"} className={`loader`} />
						) : (
							<button onClick={handleSave}>Vložit</button>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
