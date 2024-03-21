import initStripe from "stripe";

export const dynamic = "force-dynamic";

const relevantEvents = new Set([
	"checkout.session.completed",
]);

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
		try {
			switch (event.type) {
				case "checkout.session.completed":
					const customer = event.data.object.customer;
               console.log(event);

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

