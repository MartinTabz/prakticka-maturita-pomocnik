"use client";

import Link from "next/link";
import { useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import style from "@styles/admin.module.css";

export default function NewDropdownComponent() {
	const [opened, setOpened] = useState(false);
	return (
		<div
			className={style.dropdown_area}
			style={{ borderRadius: !opened ? "15px" : "15px 15px 0 0" }}
		>
			<button onClick={() => setOpened(!opened)}>
				<IoMdAddCircleOutline />
				Nový
			</button>
			{opened && (
				<div className={style.dropdown_items}>
					<Link href={"/admin/novy-produkt"}>Produkt</Link>
					<Link href={"/admin/novy-predmet"}>Předmět</Link>
					<Link href={"/admin/nova-kapitola"}>Kapitola</Link>
				</div>
			)}
		</div>
	);
}
