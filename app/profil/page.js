import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	const supabase = createServerComponentClient({ cookies });

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/prihlasit");
	}

	return (
		<main>
			<pre>{JSON.stringify(user, null, 2)}</pre>
		</main>
	);
}
