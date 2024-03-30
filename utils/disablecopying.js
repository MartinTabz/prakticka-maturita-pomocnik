"use client";

import { useEffect } from "react";

export default function DisableCopying({ children }) {
	useEffect(() => {
		const ctrlShiftKey = (e, keyCode) => {
			return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
		};

		const handleKeyDown = (e) => {
			// Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
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
	}, []);

	return <div onContextMenu={(e) => e.preventDefault()}>{children}</div>;
}
