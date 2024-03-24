"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SingOutPage() {
	const supabase = createClientComponentClient();
	const router = useRouter();

	useEffect(() => {
		const handleLogout = async () => {
			await supabase.auth.signOut();
			router.push("/prihlasit");
		};
		handleLogout();
	}, []);

	return <div>Odhlašování</div>;
}
