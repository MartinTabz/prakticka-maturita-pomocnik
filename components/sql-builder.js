"use client";

import { useState } from "react";
import axios from "axios";
import { useNotifications } from "@utils/notificationcontext";

export default function SqlBuilder() {
	const { newError } = useNotifications();

	const [tables, setTables] = useState([
		{ name: "Tabulka1", attributes: [{ name: "id", type: "int" }] },
	]);

	const deleteAttribute = (tableIndex, attributeIndex) => {
		setTables((prevTables) => {
			const updatedTables = [...prevTables];
			if (tableIndex >= 0 && tableIndex < updatedTables.length) {
				const tableToUpdate = updatedTables[tableIndex];
				if (
					attributeIndex >= 0 &&
					attributeIndex < tableToUpdate.attributes.length
				) {
					const updatedAttributes = tableToUpdate.attributes.filter(
						(_, index) => index !== attributeIndex
					);
					updatedTables[tableIndex] = {
						...tableToUpdate,
						attributes: updatedAttributes,
					};
				} else {
					console.error("Invalid attribute index:", attributeIndex);
				}
			} else {
				console.error("Invalid table index:", tableIndex);
			}
			return updatedTables;
		});
	};

	const handleDeleteTable = (tableIndex) => {
		setTables((prevTables) => {
			const updatedTables = prevTables.filter(
				(_, index) => index !== tableIndex
			);
			return updatedTables;
		});
	};

	const handleNewTable = (e) => {
		e.preventDefault();
		const tableName = e.target[0].value;

		const isExistingTable = tables.some((table) => table.name === tableName);

		if (isExistingTable) {
			newError(`Tabulka s názvem "${tableName}" již existuje`);
			return;
		} else {
			const newTable = {
				name: tableName,
				attributes: [{ name: "id", type: "int" }],
			};
			setTables((prevTables) => [...prevTables, newTable]);
		}

		e.target[0].value = "";
	};

	const handleNewAttribute = (e, tableIndex, dataType) => {
		e.preventDefault();
		const attributeName = e.target[0].value;

		setTables((prevTables) => {
			const updatedTables = [...prevTables];
			if (tableIndex >= 0 && tableIndex < updatedTables.length) {
				const tableToUpdate = updatedTables[tableIndex];
				if (
					tableToUpdate.attributes.some((attr) => attr.name === attributeName)
				) {
					newError("Tento atribut již v tabulce existuje");
				} else {
					const updatedAttributes = [
						...tableToUpdate.attributes,
						{ name: attributeName, dataType: "" },
					];
					updatedTables[tableIndex] = {
						...tableToUpdate,
						attributes: updatedAttributes,
					};
				}
			}
			return updatedTables;
		});

		e.target[0].value = "";
	};

	return (
		<section>
			<div>
				<div>
					<h1>Vytvářeč SQL dotazů</h1>
					<p></p>
				</div>
				<section>
					<h2>Tabulky</h2>
					{tables.map((t, index) => (
						<div key={index}>
							<div>
								<h3>{t.name}</h3>
								<button onClick={() => handleDeleteTable(index)}>X</button>
							</div>

							<div>
								{t.attributes.map((a, i) => (
									<div index={i}>
										<span>{a.name}</span>
										<i>({a.type})</i>
										<button onClick={() => deleteAttribute(index, i)}>X</button>
									</div>
								))}
								<form onSubmit={(e) => handleNewAttribute(e, index)}>
									<input placeholder="Nový atribut" type="text" />
									// Dropdown
									<button type="submit">+</button>
								</form>
							</div>
						</div>
					))}
					<form onSubmit={handleNewTable}>
						<input placeholder="Název nové tabulky" type="text" />
						<button type="submit">+</button>
					</form>
				</section>
			</div>
		</section>
	);
}
