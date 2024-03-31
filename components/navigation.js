import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import NavigationInner from "./navigation-inner";

export const dynamic = "force-dynamic";

export default async function Navigation({ isLightTheme }) {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	var isAdmin = false;

	if (session?.user?.id) {
		const { data: profile } = await supabase
			.from("profile")
			.select("admin")
			.eq("id", session.user.id)
			.single();

		if (profile != null) {
			isAdmin = profile?.admin;
		}
	}

	return (
		<NavigationInner
			isLightTheme={isLightTheme}
			session={session}
			isAdmin={isAdmin}
		/>
	);
}
