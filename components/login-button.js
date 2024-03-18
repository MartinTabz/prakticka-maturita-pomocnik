"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginButton() {
	const supabase = createClientComponentClient();

	const handleLogin = async () => {
		await supabase.auth.signInWithOAuth({
			provider: "github",
			options: {
				redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/auth/callback`,
			},
		});
	};

	return <button onClick={handleLogin}>Přihlásit přes GitHub</button>;
}
