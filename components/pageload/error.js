"use client";

import Link from "next/link";
import { useEffect } from "react";
import style from "@styles/pageload.module.css";

export default function ErrorComponent({ error, reset }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className={style.area}>
			<div className={style.inner}>
				<h1>Něco se pokazilo!</h1>
				<div className={style.cta}>
					<button onClick={() => reset()}>Zkusit znovu</button>
					<Link href={"/"}>Domů</Link>
				</div>
			</div>
		</main>
	);
}
