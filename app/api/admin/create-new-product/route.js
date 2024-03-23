import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getServiceSupabase } from "@utils/supabase";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
	const supabaseAuth = createRouteHandlerClient({ cookies });
	const {
		data: { session },
	} = await supabaseAuth.auth.getSession();

	if (!session) {
		return sendResponse(false, "Není přihlášen uživatel", 401);
	}

	const { data: profile } = await supabaseAuth
		.from("profile")
		.select("admin")
		.eq("id", session.user.id)
		.single();

	if (profile == null || profile?.admin == false) {
		return sendResponse(false, "Neoprávněný uživatel", 401);
	}

	var formData = null;

	try {
		const data = await req.json();
		formData = data;
		if (!data) {
			return sendResponse(false, "Nebyla odeslána data", 400);
		}
	} catch (error) {
		return sendResponse(false, "Nebyla odeslána data", 400);
	}

	if (!formData?.product_id) {
		return sendResponse(false, "Nebyla odeslán Stripe product ID", 400);
	}

	try {
		const stripeProductData = await stripe.products.retrieve(
			formData.product_id
		);
		console.log(stripeProductData);
	} catch (error) {
		console.log(error);
		return sendResponse(false, "Uvedený Stripe produkt neexistuje", 404);
	}

	const supabase = getServiceSupabase();

	const productExists = await supabase
		.from("product")
		.select("id")
		.eq("stripe_product", formData.product_id);

	if (productExists.data.length > 0) {
		return sendResponse(
			false,
			"Uvedený Stripe produkt již existuje v databázi",
			400
		);
	}

	if (!formData.name || !formData.slug) {
		return sendResponse(false, "Chybí některé údaje", 400);
	}

	const insertNew = await supabase
		.from("product")
		.insert([
			{
				stripe_product: formData.product_id,
				name: formData.name,
				active: false,
				slug: formData.slug,
				description: formData.description,
			},
		])
		.select();

	if (insertNew.error == null) {
		return sendResponse(true, null, 200);
	} else {
		return sendResponse(false, insertNew?.error?.message, 400);
	}
}

function sendResponse(success, error, status) {
	const send = {
		success: success,
		error: error,
	};
	return new Response(JSON.stringify(send), { status: status });
}
