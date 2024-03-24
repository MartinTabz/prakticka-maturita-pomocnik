"use client";

import { useState } from "react";
import Link from "next/link";
import style from "@styles/navigation.module.css";
import { FaAngleDown } from "react-icons/fa";

export default function NavigationInner({ session, isLightTheme }) {
	const [menuOpened, setMenuOpened] = useState(false);
	const [userSubMenuOpened, setUserSubMenuOpened] = useState(false);
	return (
		<header
			className={`${isLightTheme ? style.light : style.dark} ${style.header}`}
		>
			<div className={style.inner}>
				<div className={style.logo}>Maturita</div>
				<nav>
					<Link href={"/"}>Domů</Link>
					<Link href={"/produkty"}>Produkty</Link>
				</nav>
				{session ? (
					<div className={style.user_submenu}>
						<img
							onClick={() => setUserSubMenuOpened(!userSubMenuOpened)}
							src={session.user.user_metadata.avatar_url}
						/>
						<div className={style.submenu_dropdown}>
							<div
								style={{
									transform:
										userSubMenuOpened && "rotate(180deg) translateY(3px)",
									transition: "var(--ef-trans)",
								}}
								onClick={() => setUserSubMenuOpened(!userSubMenuOpened)}
							>
								<FaAngleDown />
							</div>
							{userSubMenuOpened && (
								<div className={style.submenu_container}>
									<span>{session.user.user_metadata.user_name}</span>
									<Link href={"/profil"}>Profil</Link>
									<Link href={"/odhlasit"}>Odhlásit</Link>
								</div>
							)}
						</div>
					</div>
				) : (
					<Link className={style.login_btn} href={"/prihlasit"}>
						Přihlásit se
					</Link>
				)}
				<div
					className={`${menuOpened && style.active_hamburger} ${
						style.hamburger
					}`}
					onClick={() => setMenuOpened(!menuOpened)}
				>
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
			<div
				className={`${
					!menuOpened ? style.active_mobile_menu : style.inactive_mobile_menu
				} ${style.mobile_menu}`}
			>
				<div>
					<Link href={"/"}>Domů</Link>
					<Link href={"/produkty"}>Produkty</Link>
					{session ? (
						<>
							<Link href={"/odhlasit"}>Odhlásit</Link>
							<Link href={"/profil"}>
								<img src={session.user.user_metadata.avatar_url} />
								Profil
							</Link>
						</>
					) : (
						<Link href={"/prihlasit"}>Přihlásit se</Link>
					)}
				</div>
			</div>
		</header>
	);
}
