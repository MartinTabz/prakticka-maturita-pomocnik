import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@utils/supabase";

export const dynamic = "force-dynamic";

export async function POST(req) {
	const supabaseAuth = createRouteHandlerClient({ cookies });
	const {
		data: { session },
	} = await supabaseAuth.auth.getSession();

	if (!session) {
		return sendResponse(null, "Není přihlášen uživatel", 200);
	}

	const { data: profile } = await supabaseAuth
		.from("profile")
		.select("admin")
		.eq("id", session.user.id)
		.single();

	if (profile == null || profile?.admin == false) {
		return sendResponse(null, "Neoprávněný uživatel", 200);
	}

	var formData = null;

	try {
		const data = await req.json();
		formData = data;
		if (!data) {
			return sendResponse(null, "Nebyla odeslána data", 200);
		}
	} catch (error) {
		return sendResponse(null, "Nebyla odeslána data", 200);
	}

	if (!formData?.product_id || !formData?.user_id) {
		return sendResponse(null, "Chybí některá povinná pole", 200);
	}

	console.log(formData);

	const supabase = getServiceSupabase();

	const orderExists = await supabase
		.from("purchase")
		.select("active")
		.eq("product_id", formData.product_id)
		.eq("profile_id", formData.user_id)
		.single();

	if (orderExists?.data == null) {
		const insertNew = await supabase
			.from("purchase")
			.insert([
				{
					product_id: formData.product_id,
					profile_id: formData.user_id,
					active: true,
				},
			])
			.select();
		if (insertNew?.error) {
			return sendResponse(null, insertNew.error.message, 200);
		} else {
			return sendResponse("Produkt byl přiřazen", null, 200);
		}
	} else if (orderExists?.data?.active == true) {
		return sendResponse("Uživatel již produkt má aktivovaný", null, 200);
	} else if (orderExists?.data?.active == false) {
		const orderUpdate = await supabase
			.from("purchase")
			.update({ active: true })
			.eq("product_id", formData.product_id)
			.eq("profile_id", formData.user_id)
			.select();
		if (orderUpdate?.error) {
			return sendResponse(null, orderUpdate.error.message, 200);
		} else {
			return sendResponse("Produkt byl znovuaktivován", null, 200);
		}
	} else {
		return sendResponse(null, "Něco se pokazilo", 200);
	}
}

function sendResponse(success, error, status) {
	const send = {
		success: success,
		error: error,
	};
	return new Response(JSON.stringify(send), { status: status });
}
