import style from "@styles/pageload.module.css";
import Link from "next/link";

export default function NotFoundComponent() {
	return (
		<main className={style.area}>
			<div className={style.inner}>
				<h1>Error 404</h1>
				<span>Stranka nenalezena</span>
				<Link className={style.home_btn} href={"/"}>Domů</Link>
			</div>
		</main>
	);
}
