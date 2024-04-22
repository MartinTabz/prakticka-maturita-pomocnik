import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req) {
	const supabaseAuth = createRouteHandlerClient({ cookies });
	const {
		data: { session },
	} = await supabaseAuth.auth.getSession();

	if (!session) {
		return sendResponse(null, "Není přihlášen uživatel", 401);
	}

	const { data: purchase } = await supabaseAuth
		.from("purchase")
		.select("active")
		.eq("profile_id", session.user.id)
		.eq("product_id", "42bac6af-9c9f-4289-a486-b6973a079131")
		.single();

	if (purchase == null || purchase?.active == false) {
		return sendResponse(null, "Neoprávněný uživatel", 401);
	}

	var formData = null;

	try {
		const data = await req.json();
		formData = data;
		if (!data) {
			return sendResponse(null, "Nebyla odeslána data", 400);
		}
	} catch (error) {
		return sendResponse(null, "Nebyla odeslána data", 400);
	}

	if (!formData.tables.length >= 1) {
		return sendResponse(null, "Musí být alespoň jedna tabulka", 400);
	}
	if (!formData.action) {
		return sendResponse(null, "Musí být uvedena akce", 400);
	}
	if (formData.definition.length < 10) {
		return sendResponse(null, "Definice musí být delší", 400);
	}

	console.log(formData);

	return sendResponse("Gay", null, 200);
}

function sendResponse(result, error, status) {
	const send = {
		result: result,
		error: error,
	};
	return new Response(JSON.stringify(send), { status: status });
}
