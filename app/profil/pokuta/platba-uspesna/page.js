import Link from "next/link";
import style from "@styles/checkout.module.css";
import { IoShieldCheckmark } from "react-icons/io5";

export default async function OrderSuccessPage() {
	return (
		<main className={style.area}>
			<IoShieldCheckmark className={style.success} />
			<h1>Platba pokuty proběhla úspěšně!</h1>
			<p>
				Děkuji za zaplacení, během pár sekund by se vám měl zpřístupnit produkt.
				Pokud se tak neděje, kontaktujte prosím podporu.
			</p>
			<Link href={"/produkty"}>Zpět na produkty</Link>
		</main>
	);
}
