import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import initStripe from "stripe";
import PurchaseButton from "@components/purchase-button";

export const dynamic = "force-dynamic";

export default async function ProductPage() {
	const supabase = createServerComponentClient({ cookies });
	const stripe = initStripe(process.env.STRIPE_SECRET_KEY);

	const { data: rawProducts, error } = await supabase
		.from("product")
		.select("*")
		.eq("active", true);

	if (error) {
		throw new Error(error.message);
	}

	const {
		data: { session },
	} = await supabase.auth.getSession();

	const fetchProductData = async (product) => {
		const stripeProduct = await stripe.products.retrieve(
			product.stripe_product
		);
		const { name, description, default_price } = stripeProduct;

		const priceData = await stripe.prices.retrieve(default_price);
		const { unit_amount } = priceData;

		var owned = false;

		if (session) {
			const { data } = await supabase
				.from("order")
				.select("active")
				.eq("product_id", product.id)
				.eq("profile_id", session.user.id)
				.single();

			if (data?.active == true) {
				owned = true;
			}
		}

		return {
			id: product.id,
			name,
			description,
			stripe_price: default_price,
			unit_amount,
			owned,
			slug: product.slug,
		};
	};
   
	const products = await Promise.all(rawProducts.map((product) => fetchProductData(product)));


	return (
		<main>
			<h1>Produkty</h1>
			<div>
				{products ? (
					products.map((product) => (
						<div key={product.id}>
							<h2>{product.name}</h2>
							<p>{product.description}</p>
							<span>{product.unit_amount / 100} Kč</span>
							{session ? (
								product.owned ? (
									<Link href={`/produkt/${product.slug}`}>Otevřít</Link>
								) : (
									<PurchaseButton price={product.stripe_price} />
								)
							) : (
								<Link href={"/prihlasit"}>Přihlásit se</Link>
							)}
						</div>
					))
				) : (
					<span>Zatím se zde nenachází žádné produkty.</span>
				)}
			</div>
		</main>
	);
}
