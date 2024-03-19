import Link from "next/link";

export default function OrderFailedPage() {
	return (
		<main>
			<h1>Objednávka byla zrušena!</h1>
			<span>
				Zrušili jste nákupní proces, nebo se něco pokazilo. Zkuste to znovu,
				nebo kontaktujte podporu
			</span>
			<Link href={"/produkty"}>Zpět na produkty</Link>
		</main>
	);
}
