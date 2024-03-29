import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import initStripe from "stripe";
import PurchaseButton from "@components/purchase-button";
import Navigation from "@components/navigation";
import style from "@styles/allproducts.module.css";
import Image from "next/image";

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
			image: product.image,
		};
	};

	const products = await Promise.all(
		rawProducts.map((product) => fetchProductData(product))
	);

	return (
		<>
			<Navigation isLightTheme={true} />
			<main className={style.main}>
				<div className={style.area}>
					<h1>Produkty</h1>
					<div className={style.products_area}>
						{products ? (
							products.map((product) => (
								<div className={style.product} key={product.id}>
									<div className={style.product_image}>
										<Image
											src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/subjects/${product.image}`}
											alt="Ilustrační obrázek k produktu"
											width={600}
											height={200}
										/>
									</div>
									<div className={style.product_desc}>
										<div className={style.product_text}>
											<h2>{product.name}</h2>
											<p>{product.description}</p>
										</div>
										<div className={style.bottom}>
											{session ? (
												product.owned ? (
													<Link
														className={style.open}
														href={`/produkt/${product.slug}`}
													>
														Otevřít
													</Link>
												) : (
													<PurchaseButton price={product.stripe_price} />
												)
											) : (
												<Link className={style.login} href={"/prihlasit"}>
													Přihlásit se
												</Link>
											)}
											<span>{product.unit_amount / 100} Kč</span>
										</div>
									</div>
								</div>
							))
						) : (
							<span>Zatím se zde nenachází žádné produkty.</span>
						)}
					</div>
				</div>
			</main>
		</>
	);
}
