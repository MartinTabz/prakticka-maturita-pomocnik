import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navigation from "@components/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		redirect("/prihlasit");
	}

	return (
		<main>
			<Navigation isLightTheme={true} />
			<pre>{JSON.stringify(session, null, 2)}</pre>
		</main>
	);
}
