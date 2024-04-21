import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SqlBuilder from "@components/sql-builder";

export default async function SqlCommandCreator() {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/prihlasit");
	}

	const hasPurchase = await supabase
		.from("purchase")
		.select("*")
		.eq("product_id", "42bac6af-9c9f-4289-a486-b6973a079131")
		.eq("profile_id", session.user.id);

	console.log(hasPurchase);

	if (hasPurchase?.error) {
		throw new Error(hasPurchase.error.message);
	} else if (hasPurchase?.data.length <= 0) {
		redirect("/produkty");
	} else if (hasPurchase?.data[0].active == false) {
		redirect("/produkty");
	}

	return <SqlBuilder />;
}
