import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginButton from "@components/login-button";
import style from "@styles/login.module.css";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
	const supabase = createServerComponentClient({ cookies });
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/profil");
	}

	return (
		<main className={style.main}>
			<div className={style.area}>
				<h1>Přihlášení</h1>
				<LoginButton />
			</div>
		</main>
	);
}
