import Link from "next/link";

export default function OrderSuccessPage() {
	return (
		<main>
			<h1>Objednávka proběhla úspěšně!</h1>
			<span>
				Děkuji za zakoupení, během pár sekund by se vám měl zpřístupnit produkt.
				Pokud se tak neděje, kontaktujte prosím podporu.
			</span>
			<Link href={"/produkty"}>Zpět na produkty</Link>
		</main>
	);
}
