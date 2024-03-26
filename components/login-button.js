"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { FiLoader } from "react-icons/fi";

export default function LoginButton() {
	const supabase = createClientComponentClient();
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		setIsLoading(true);

		try {
			await supabase.auth.signInWithOAuth({
				provider: "github",
				options: {
					redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/auth/callback`,
				},
			});
		} catch (error) {
			console.log(error.message);
		}
	};

	return (
		<div>
			{isLoading ? (
				<FiLoader
					style={{ fontSize: "2rem" }}
					color="white"
					className="loader"
				/>
			) : (
				<button
					disabled={isLoading}
					onClick={() => {
						setIsLoading(true);
						handleLogin();
					}}
				>
					<FaGithub />
					Přihlásit přes GitHub
				</button>
			)}
		</div>
	);
}
