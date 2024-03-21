import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect, notFound } from "next/navigation";

export default async function AdminLayout({ children }) {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/prihlasit");
	}

	const { data: profile } = await supabase
		.from("profile")
		.select("admin")
		.eq("id", session.user.id)
		.single();

	if (!profile || profile?.admin == false) {
		notFound();
	}

	return <main>{children}</main>;
}
