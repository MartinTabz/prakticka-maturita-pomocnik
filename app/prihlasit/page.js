import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginButton from "@components/login-button";

export default async function LoginPage() {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/profil");
	}

	return <LoginButton />;
}
