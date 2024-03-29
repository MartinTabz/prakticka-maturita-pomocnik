import Link from "next/link";
import initStripe from "stripe";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import style from "@styles/checkout.module.css";
import { IoShieldCheckmark } from "react-icons/io5";

const stripe = initStripe(process.env.STRIPE_SECRET_KEY);

export default async function OrderSuccessPage({ searchParams: { s } }) {
	var productData = null;

	if (s) {
		try {
			const supabase = createServerComponentClient({ cookies });
			const lineItems = await stripe.checkout.sessions.listLineItems(s);
			const { data: product } = await supabase
				.from("product")
				.select("name, slug")
				.eq("stripe_product", lineItems.data[0].price.product)
				.single();
			if (product) {
				productData = product;
			}
		} catch (error) {
			console.error(error.message);
		}
	}

	return (
		<main className={style.area}>
			{productData ? (
				<>
					<IoShieldCheckmark className={style.success} />
					<span>Úspěšně jste zakoupili produkt</span>
					<h1>{productData.name}</h1>
					<p>
						Děkuji za zakoupení, během pár sekund by se vám měl zpřístupnit
						produkt. Pokud se tak neděje, kontaktujte prosím podporu.
					</p>
					<Link href={`/produkt/${productData.slug}`}>Otevřít produkt</Link>
				</>
			) : (
				<>
					<IoShieldCheckmark className={style.success} />
					<h1>Objednávka proběhla úspěšně!</h1>
					<p>
						Děkuji za zakoupení, během pár sekund by se vám měl zpřístupnit
						produkt. Pokud se tak neděje, kontaktujte prosím podporu.
					</p>
					<Link href={"/produkty"}>Zpět na produkty</Link>
				</>
			)}
		</main>
	);
}
