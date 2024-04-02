import Link from "next/link";
import style from "@styles/checkout.module.css";
import { MdErrorOutline } from "react-icons/md";

export default function OrderFailedPage() {
	return (
		<main className={style.area}>
			<MdErrorOutline className={style.fail} />
			<h1>Platba pokuty byla zrušena!</h1>
			<p>
				Zrušili jste nákupní proces, nebo se něco pokazilo. Zkuste to znovu,
				nebo kontaktujte podporu
			</p>
			<Link href={"/profil"}>Zpět na profil</Link>
		</main>
	);
}
