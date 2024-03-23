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

	if (!formData?.subject || !formData?.name) {
		return sendResponse(false, "Chybí některá povinná pole", 400);
	}

	const supabase = getServiceSupabase();

	const subjectExists = await supabase
		.from("subject")
		.select("id")
		.eq("id", formData.subject)
		.single();

	if (subjectExists?.data == null) {
		return sendResponse(false, "Uvedený předmět neexistuje", 400);
	}

	const nameExists = await supabase
		.from("chapter")
		.select("id")
		.eq("name", formData.name)
		.eq("subject_id", formData.subject)
		.single();

	if (nameExists?.data != null) {
		return sendResponse(
			false,
			"Název kapitoly je již pro vybraný předmět využívaný",
			400
		);
	}

	const lastChapter = await supabase
		.from("chapter")
		.select("rank")
		.eq("subject_id", formData.subject)
		.order("rank", { ascending: false });

	if (lastChapter?.error) {
		return sendResponse(false, lastChapter.error.message, 400);
	}

	let givenRank;

	if (lastChapter?.data?.length <= 0) {
		givenRank = 1;
	} else {
		givenRank = lastChapter?.data[0].rank + 1;
	}

	const insertNew = await supabase
		.from("chapter")
		.insert([
			{
				name: formData.name,
				description: formData.description || "",
				subject_id: formData.subject,
				html: formData.html,
				rank: givenRank,
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
