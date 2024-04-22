"use client";

import { useState } from "react";
import axios from "axios";
import { useNotifications } from "@utils/notificationcontext";

export default function SqlBuilder() {
	const { newError } = useNotifications();
	const [actions, setActions] = useState([
		{ name: "SELECT", desc: "Vypsat" },
		{ name: "INSERT", desc: "Vložit" },
		{ name: "DELETE", desc: "Smazat" },
		{ name: "UPDATE", desc: "Upravit" },
	]);

	const [tables, setTables] = useState([]);
	const [activeAction, setActiveAction] = useState("");
	const [definition, setDefinition] = useState("");

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
				attributes: [{ name: "id", type: "pk" }],
			};
			setTables((prevTables) => [...prevTables, newTable]);
		}

		e.target[0].value = "";
	};

	const handleNewAttribute = (e, tableIndex) => {
		e.preventDefault();
		const attributeName = e.target[0].value;
		const typeName = e.target[1].value;

		if (!attributeName || !typeName) {
			newError("Jméno a typ je povinný");
			return;
		}

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
						{ name: attributeName, type: typeName },
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

	const handleSend = (e) => {
		e.preventDefault();
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
					<div>
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
											<button onClick={() => deleteAttribute(index, i)}>
												X
											</button>
										</div>
									))}
									<form onSubmit={(e) => handleNewAttribute(e, index)}>
										<input placeholder="Nový atribut" type="text" />
										<select>
											<option value="int">Číslo</option>
											<option value="string">Text</option>
											<option value="bool">Ano/Ne</option>
											<option value="pk">Primární klíč</option>
											<option value="fk">Cizí klíč</option>
										</select>
										<button type="submit">+</button>
									</form>
								</div>
							</div>
						))}
						<form onSubmit={handleNewTable}>
							<input placeholder="Název nové tabulky" type="text" />
							<button type="submit">+</button>
						</form>
					</div>
				</section>
				<section>
					<h2>Akce</h2>
					<div>
						{actions.map((action, index) => (
							<div
								key={index}
								onClick={() => setActiveAction(action.name)}
								style={{
									border: activeAction == action.name && "2px solid grey",
								}}
							>
								<h3>{action.name}</h3>
								<p>{action.desc}</p>
							</div>
						))}
					</div>
				</section>
				<section>
					<h2>Definice</h2>
					<textarea
						value={definition}
						onChange={(e) => {
							setDefinition(e.target.value);
						}}
						placeholder={
							activeAction == "SELECT"
								? "Vypiš z tabulky X počet Y, které jsou starší než Z"
								: activeAction == "INSERT"
								? "Vlož do tabulky X nový záznam, který bude mít hodnoty: Y = y, Z = z"
								: activeAction == "DELETE"
								? "Smaž záznam, kde id je 3"
								: activeAction == "UPDATE"
								? "U tabulky X uprav atribut Y na hodnotu Z"
								: "Napiš co chceš aby příkaz dělal"
						}
					/>
				</section>
				<button onClick={handleSend}>Vytvořit</button>
			</div>
		</section>
	);
}
