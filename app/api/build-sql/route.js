import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import OpenAI from "openai";
import { getServiceSupabase } from "@utils/supabase";

const rateLimit = new Ratelimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(10, "15s"),
});

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API,
});

export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function POST(req) {
	const ip = req.ip ?? "127.0.0.1";

	const { limit, reset, remaining } = await rateLimit.limit(ip);

	const supabaseAuth = createRouteHandlerClient({ cookies });
	const {
		data: { session },
	} = await supabaseAuth.auth.getSession();

	if (!session) {
		return sendResponse(null, "Není přihlášen uživatel", 401);
	}

	const { data: purchase } = await supabaseAuth
		.from("purchase")
		.select("active, uses")
		.eq("profile_id", session.user.id)
		.eq("product_id", "42bac6af-9c9f-4289-a486-b6973a079131")
		.single();

	if (purchase == null || purchase?.active == false) {
		return sendResponse(null, "Neoprávněný uživatel", 401);
	}

	if (purchase?.uses <= 0) {
		return sendResponse(null, "Byl vyčerpán počet možných generování", 400);
	}

	const uses = purchase.uses;

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

	if (remaining === 0) {
		return new Response(
			JSON.stringify({
				result: null,
				error: "Můžete posílat dotazy pouze jednou za 15 sekund",
			}),
			{
				status: 429,
				headers: {
					"X-RateLimit-Limit": limit.toString(),
					"X-RateLimit-Remaining": remaining.toString(),
					"X-RateLimit-Reset": reset.toString(),
				},
			}
		);
	} else {
		const { tables, relations, action, definition } = formData;

		const sentence = `Počet tabulek ve schématu: ${
			tables.length
		} => ${generateTableSentences(tables)} ${generateRelationSentences(
			relations
		)} Používat se bude akce ${action}. Uživatel chce, aby tento dotaz (query) dělal následující: ${definition}`;

		const thread = await openai.beta.threads.create();
		await openai.beta.threads.messages.create(thread.id, {
			role: "user",
			content: sentence,
		});
		let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
			assistant_id: "asst_hAbJbCik9ICf50jS0IrLGlaB",
		});
		if (run.status === "completed") {
			const messages = await openai.beta.threads.messages.list(run.thread_id);
			console.log(messages);
			const query = JSON.parse(
				messages?.body?.data[0]?.content[0]?.text?.value
			);
			if (query.query) {
				const supabase = getServiceSupabase();
				await supabase
					.from("purchase")
					.update({ uses: uses - 1 })
					.eq("profile_id", session.user.id)
					.eq("product_id", "42bac6af-9c9f-4289-a486-b6973a079131")
					.single();
				return sendResponse(query.query, null, 200);
			} else {
				return sendResponse(null, "Něco se pokazilo", 400);
			}
		} else {
			return sendResponse(null, "Něco se pokazilo", 400);
		}
	}
}

function sendResponse(result, error, status) {
	const send = {
		result: result,
		error: error,
	};
	return new Response(JSON.stringify(send), { status: status });
}

const generateTableSentences = (tables) => {
	return tables
		.map((table, index) => {
			const tableAttributes = table.attributes
				.map((attr) => `${attr.name} (${attr.type})`)
				.join(", ");
			return `${index + 1}. tabulka se jmenuje ${
				table.name
			} a má atributy: ${tableAttributes}.`;
		})
		.join(" ");
};

const generateRelationSentences = (relations) => {
	if (relations.length > 0) {
		return relations
			.map((relation, index) => {
				return `Vztah ${index + 1}: ${
					relation.fk
				} je cizí klíč, který je spojen s ${relation.pk}.`;
			})
			.join(" ");
	} else {
		return "";
	}
};
