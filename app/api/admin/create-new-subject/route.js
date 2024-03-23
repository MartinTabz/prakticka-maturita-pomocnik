import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@utils/supabase";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

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

	var data = null;

	try {
		data = await req.formData();
		if (!data) {
			return sendResponse(false, "Nebyla odeslána data", 400);
		}
	} catch (error) {
		return sendResponse(false, "Nebyla odeslána data", 400);
	}

	const name = data.get("name").trim();
	const description = data.get("description").trim();
	const product = data.get("product").trim();
	const slug = data.get("slug").trim();
	const file = data.get("image");

	if (!name || !slug || !product) {
		return sendResponse(false, "Chybí některé povinné pole", 400);
	}

	if (!file) {
		return sendResponse(false, "Chybí obrázek", 400);
	}

	const supabase = getServiceSupabase();

	const { data: productExists } = await supabase
		.from("product")
		.select("id")
		.eq("id", product)
		.single();

	if (productExists == null) {
		return sendResponse(false, "Přiřazený produkt neexistuje", 400);
	}

	const { data: nameExists } = await supabase
		.from("subject")
		.select("id")
		.eq("name", name)
		.eq("product_id", product)
		.single();

	if (nameExists != null) {
		return sendResponse(
			false,
			"Předmět s tímto jménem již u produktu existuje",
			400
		);
	}

	const { data: slugExists } = await supabase
		.from("subject")
		.select("id")
		.eq("slug", slug)
		.eq("product_id", product)
		.single();

	if (slugExists != null) {
		return sendResponse(
			false,
			"Předmět s tímto slugem již u produktu existuje",
			400
		);
	}

	let path;
	let attempts = 0;

	do {
		const fileExt = file.name.split(".").pop();
		const filePath = `${uuidv4()}-${crypto
			.randomBytes(16)
			.toString("hex")}.${fileExt}`;

		const { data: upload_data, error: upload_error } = await supabase.storage
			.from("subjects")
			.upload(filePath, file);

		if (upload_error && !upload_error.error === "Duplicate") {
			return sendResponse(false, upload_error.message, 400);
		}

		if (upload_data.path) {
			path = upload_data.path;
		}
		attempts = attempts + 1;
	} while (!path || attempts >= 10);

	if (attempts >= 10) {
		return sendResponse(false, "Něco se pokazilo při nahrávání obrázku", 400);
	}

	const supabaseUpload = await supabase
		.from("subject")
		.insert([
			{
				name: name,
				image: path,
				description: description || "",
				product_id: product,
				slug: slug,
			},
		])
		.select();

	if (supabaseUpload?.error) {
		return sendResponse(false, supabaseUpload?.error?.message, 400);
	}

	return sendResponse(true, null, 200);
}

function sendResponse(success, error, status) {
	const send = {
		success: success,
		error: error,
	};
	return new Response(JSON.stringify(send), { status: status });
}
