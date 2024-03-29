import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
	const supabase = createRouteHandlerClient({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return sendResponse(null, "Není přihlášen uživatel", 401);
	}

	var price = null;

	try {
		const data = await req.json();
		if (data?.price) {
			price = data.price;
		} else {
			return sendResponse(null, "Nepodařilo se získat Stripe cenu", 400);
		}
	} catch (error) {
		return sendResponse(null, "Nepodařilo se získat Stripe cenu", 400);
	}

	if (!price) {
		return sendResponse(null, "Nebyla poskytnuta Stripe cena", 400);
	}

	const priceData = await stripe.prices.retrieve(price);

	const orderExists = await supabase
		.from("order")
		.select("active, product_id!inner(*)")
		.eq("profile_id", session.user.id)
		.eq("product_id.stripe_product", priceData.product)
		.single();

	if (orderExists?.data != null && orderExists?.data?.active == true) {
		return sendResponse(null, "Tento produkt máte již zakoupený", 400);
	}

	const userProfile = await supabase
		.from("profile")
		.select("stripe_customer")
		.eq("id", session.user.id)
		.single();

	if (
		userProfile?.error != null ||
		userProfile?.data?.stripe_customer == null
	) {
		return sendResponse(
			null,
			"Nebylo možné najít identifikátor Stripe zákazníka na vašem profilu. Kontaktujte podporu.",
			400
		);
	}

	try {
		const sessionSettings = {
			payment_method_types: ["card"],
			line_items: [
				{
					price: price,
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/objednavka/uspech?s={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/objednavka/zruseno`,
			customer: userProfile.data.stripe_customer,
		};

		const { url } = await stripe.checkout.sessions.create(sessionSettings);
		if (url) {
			return sendResponse(url, null, 200);
		} else {
			return sendResponse(
				null,
				"Něco se pokazilo při vytváření objednávky. Zkuste to později.",
				400
			);
		}
	} catch (error) {
		console.error(error.message);
		return sendResponse(
			null,
			"Něco se pokazilo při vytváření objednávky. Zkuste to později.",
			400
		);
	}
}

function sendResponse(url, error, status) {
	const send = {
		url: url,
		error: error,
	};
	return new Response(JSON.stringify(send), { status: status });
}
