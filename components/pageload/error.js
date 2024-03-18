"use client";

import Link from "next/link";
import { useEffect } from 'react'

export default function ErrorComponent({ error, reset }) {

   useEffect(() => {
      console.error(error)
    }, [error]);

	return (
		<main>
			<h1>Něco se pokazilo!</h1>
			<div>
				<button onClick={() => reset()}>Zkusit znovu</button>
				<Link href={"/"}>Domů</Link>
			</div>
		</main>
	);
}
