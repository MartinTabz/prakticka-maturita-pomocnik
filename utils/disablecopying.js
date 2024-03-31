"use client";

import { useEffect } from "react";

export default function DisableCopying({ children }) {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_ENV == "production") {
			const ctrlShiftKey = (e, keyCode) => {
				return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
			};

			const handleKeyDown = (e) => {
				if (
					e.keyCode === 123 ||
					ctrlShiftKey(e, "I") ||
					ctrlShiftKey(e, "J") ||
					ctrlShiftKey(e, "C") ||
					(e.ctrlKey && e.keyCode === "U".charCodeAt(0))
				) {
					e.preventDefault();
				}
			};

			document.addEventListener("keydown", handleKeyDown);

			return () => {
				document.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, []);

	return <div onContextMenu={(e) => e.preventDefault()}>{children}</div>;
}
