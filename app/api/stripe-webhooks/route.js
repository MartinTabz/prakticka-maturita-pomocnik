import initStripe from "stripe";
import { getServiceSupabase } from "@utils/supabase";

export const dynamic = "force-dynamic";

const relevantEvents = new Set(["checkout.session.completed"]);

export async function POST(req) {
	const stripe = initStripe(process.env.STRIPE_SECRET_KEY);
	const body = await req.text();
	const sig = req.headers.get("stripe-signature");
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	let event;

	try {
		if (!sig || !webhookSecret) {
			return new Response("Webhook secret not found.", { status: 400 });
		}
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
	} catch (err) {
		console.log(`❌ Error message: ${err.message}`);
		return new Response(`Webhook Error: ${err.message}`, { status: 400 });
	}

	if (relevantEvents.has(event.type)) {
		const supabase = getServiceSupabase();

		try {
			switch (event.type) {
				case "checkout.session.completed":
					const lineItems = await stripe.checkout.sessions.listLineItems(
						event.data.object.id
					);
					const { data: product } = await supabase
						.from("product")
						.select("id")
						.eq("stripe_product", lineItems.data[0].price.product)
						.single();

					const { data: profile } = await supabase
						.from("profile")
						.select("id")
						.eq("stripe_customer", event.data.object.customer)
						.single();

					const orderExists = await supabase
						.from("order")
						.select("active")
						.eq("profile_id", profile.id)
						.eq("product_id", product.id)
						.single();

					if (orderExists?.data != null && orderExists?.data?.active == false) {
						await supabase
							.from("order")
							.update({ active: true })
							.eq("profile_id", profile.id)
							.eq("product_id", product.id);
					} else if (orderExists?.data == null) {
						await supabase
							.from("order")
							.insert([
								{
									product_id: product.id,
									profile_id: profile.id,
									active: true,
								},
							])
							.select();
					}

					break;
				default:
					throw new Error("Unhandled relevant event!");
			}
		} catch (error) {
			console.log(error);
			return new Response(
				"Webhook handler failed. View your Next.js function logs.",
				{
					status: 400,
				}
			);
		}
	} else {
		return new Response(`Unsupported event type: ${event.type}`, {
			status: 400,
		});
	}
   
	return new Response(JSON.stringify({ received: true }));
}
