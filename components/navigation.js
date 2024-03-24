import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import NavigationInner from "./navigation-inner";

export const dynamic = "force-dynamic";

export default async function Navigation({ isLightTheme }) {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return <NavigationInner isLightTheme={isLightTheme} session={session} />;
}
