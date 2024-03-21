"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewDropdownComponent() {
	const [opened, setOpened] = useState(false);
	return (
		<div>
			<button onClick={() => setOpened(!opened)}>Nový</button>
			{opened && (
				<div>
					<Link href={"/admin/novy-produkt"}>Produkt</Link>
					<Link href={"/admin/novy-predmet"}>Předmět</Link>
					<Link href={"/admin/nova-kapitola"}>Kapitola</Link>
				</div>
			)}
		</div>
	);
}
