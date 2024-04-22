"use client";

import { useState } from "react";
import axios from "axios";
import style from "@styles/sql.module.css";
import { useNotifications } from "@utils/notificationcontext";
import { RiOpenaiFill, RiDeleteBin5Fill } from "react-icons/ri";
import { FiLoader } from "react-icons/fi";
import { TiDelete } from "react-icons/ti";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa";

export default function SqlBuilder({ uses: rawUses }) {
	const { newError } = useNotifications();
	const [actions, setActions] = useState([
		{ name: "SELECT", desc: "Vypsat" },
		{ name: "INSERT", desc: "Vložit" },
		{ name: "DELETE", desc: "Smazat" },
		{ name: "UPDATE", desc: "Upravit" },
	]);
	const [uses, setUses] = useState(rawUses);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState(null);

	const [isOpenedFk, setIsOpenedFk] = useState(false);
	const [foreignKey, setForeignKey] = useState(null);
	const [isOpenedPk, setIsOpenedPk] = useState(false);
	const [primaryKey, setPrimaryKey] = useState(null);

	const [tables, setTables] = useState([]);

	const [relations, setRelations] = useState([]);
	const [activeAction, setActiveAction] = useState(null);
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

	const deleteRelation = (e, relIndex) => {
		e.preventDefault();
		setRelations((prevRelations) => {
			const updatedRelations = prevRelations.filter(
				(_, index) => index !== relIndex
			);
			return updatedRelations;
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

	const handleNewRelation = (e) => {
		e.preventDefault();
		if (!foreignKey || !primaryKey) {
			newError("Chybí některý z klíčů");
			return;
		} else {
			const isRelationExist = relations.some(
				(relation) => relation.fk === foreignKey && relation.pk === primaryKey
			);
			if (isRelationExist) {
				newError("Tato relace již existuje");
				return;
			}
			setRelations((prevRelations) => [
				...prevRelations,
				{ fk: foreignKey, pk: primaryKey },
			]);
			setForeignKey(null);
			setPrimaryKey(null);
		}
	};

	const handleSend = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		var valid = true;

		if (!tables.length >= 1) {
			newError("Musí být alespoň jedna tabulka");
			valid = false;
		}
		if (!activeAction) {
			newError("Musí být uvedena akce");
			valid = false;
		}
		if (definition.length < 10) {
			newError("Definice musí být delší");
			valid = false;
		}

		if (valid) {
			const sentData = {
				tables: tables,
				relations: relations,
				action: activeAction,
				definition: definition,
			};

			try {
				const { data } = await axios.post("/api/build-sql", sentData);
				if (data?.result) {
					console.log(data.result);
					setResult(data.result);
					setUses(uses - 1)
				} else {
					newError("Něco se pokazilo");
				}
			} catch (error) {
				newError(error.response.data.error);
			}
		}

		setIsLoading(false);
	};

	return (
		<section className={style.section}>
			<div className={style.area}>
				<div className={style.top_info}>
					<h1>Vytvářeč SQL dotazů</h1>
					<p>
						Poháněno pomocí GPT 4.0 <RiOpenaiFill />
					</p>
				</div>
				<hr />
				<section className={style.tables_section}>
					<h2>Tabulky</h2>
					<div className={style.tables_grid}>
						{tables.map((t, index) => (
							<div className={style.table} key={index}>
								<div className={style.table_head}>
									<h3>{t.name}</h3>
									<button
										onClick={() => {
											if (!isLoading) {
												handleDeleteTable(index);
											}
										}}
									>
										<RiDeleteBin5Fill />
									</button>
								</div>

								<div className={style.table_content}>
									{t.attributes.map((a, i) => (
										<div className={style.attribute} index={i}>
											<div className={style.att_spec}>
												<span>{a.name}</span>
												<i>({a.type})</i>
											</div>
											<button
												onClick={() => {
													if (!isLoading) {
														deleteAttribute(index, i);
													}
												}}
											>
												<TiDelete />
											</button>
										</div>
									))}
									<form
										className={style.new_att}
										onSubmit={(e) => {
											if (!isLoading) {
												handleNewAttribute(e, index);
											}
										}}
									>
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
					</div>
					<form
						className={style.new_table}
						onSubmit={(e) => {
							if (!isLoading) {
								handleNewTable(e);
							}
						}}
					>
						<input placeholder="Název nové tabulky" type="text" />
						<button type="submit">+</button>
					</form>
				</section>
				<hr />
				<section className={style.relations_area}>
					<h2>Vztahy mezi tabulkami</h2>
					<div className={style.existing_rel}>
						{relations.map((rel, index) => (
							<div className={style.existing_rel_item} key={index}>
								<p>{rel.fk}</p>
								<span>
									<FaArrowRightLong />
								</span>
								<p>{rel.pk}</p>
								<button
									className={style.del_rel}
									onClick={(e) => {
										if (!isLoading) {
											deleteRelation(e, index);
										}
									}}
								>
									<RiDeleteBin5Fill />
								</button>
							</div>
						))}
					</div>
					<div className={style.add_rel}>
						<div className={style.drop_area}>
							<div>
								<h3>Cizí klíč</h3>
								<div className={style.dropdown}>
									<div
										className={style.dropdown_main}
										onClick={() => {
											if (!isLoading) {
												setIsOpenedFk(!isOpenedFk);
											}
										}}
										style={{
											borderRadius: isOpenedFk ? "10px 10px 0 0" : "10px",
										}}
									>
										<span>{foreignKey ? foreignKey : "Vybrat"}</span>
										<FaChevronDown
											style={{ transform: isOpenedFk && "rotate(180deg)" }}
										/>
									</div>
									{isOpenedFk && (
										<div className={style.dropdown_list}>
											{tables
												.flatMap((table) =>
													table.attributes
														.filter((attr) => attr.type === "fk")
														.map((attr) => ({
															tableName: table.name,
															attributeName: attr.name,
														}))
												)
												.map((t, index) => (
													<div
														className={style.dropdown_item}
														key={index}
														onClick={() => {
															if (!isLoading) {
																setForeignKey(
																	`${t.tableName}.${t.attributeName}`
																);
																setIsOpenedFk(false);
															}
														}}
													>{`${t.tableName}.${t.attributeName}`}</div>
												))}
										</div>
									)}
								</div>
							</div>
							<div>
								<h3>Primární klíč</h3>
								<div className={style.dropdown}>
									<div
										className={style.dropdown_main}
										onClick={() => {
											if (!isLoading) {
												setIsOpenedPk(!isOpenedPk);
											}
										}}
										style={{
											borderRadius: isOpenedPk ? "10px 10px 0 0" : "10px",
										}}
									>
										<span>{primaryKey ? primaryKey : "Vybrat"}</span>
										<FaChevronDown
											style={{ transform: isOpenedPk && "rotate(180deg)" }}
										/>
									</div>
									{isOpenedPk && (
										<div className={style.dropdown_list}>
											{tables
												.flatMap((table) =>
													table.attributes
														.filter((attr) => attr.type === "pk")
														.map((attr) => ({
															tableName: table.name,
															attributeName: attr.name,
														}))
												)
												.map((t, index) => (
													<div
														className={style.dropdown_item}
														key={index}
														onClick={() => {
															if (!isLoading) {
																setPrimaryKey(
																	`${t.tableName}.${t.attributeName}`
																);
																setIsOpenedPk(false);
															}
														}}
													>{`${t.tableName}.${t.attributeName}`}</div>
												))}
										</div>
									)}
								</div>
							</div>
						</div>
						<button
							className={style.add_rel_btn}
							onClick={(e) => {
								if (!isLoading) {
									handleNewRelation(e);
								}
							}}
						>
							Přidat vztah
						</button>
					</div>
				</section>
				<hr />
				<section className={style.action_area}>
					<h2>Akce</h2>
					<div className={style.actions}>
						{actions.map((action, index) => (
							<div
								className={style.action}
								key={index}
								onClick={() => {
									if (!isLoading) {
										setActiveAction(action.name);
									}
								}}
								style={{
									border:
										activeAction == action.name
											? "3px solid var(--clr-main)"
											: "1px solid grey",
								}}
							>
								<h3>{action.name}</h3>
								<p>({action.desc})</p>
							</div>
						))}
					</div>
				</section>
				<hr />
				<section className={style.def}>
					<h2>Definice</h2>
					<textarea
						value={definition}
						onChange={(e) => {
							if (!isLoading) {
								setDefinition(e.target.value);
							}
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
				{result && (
					<section className={style.result_section}>
						<div className={style.result_inner}>{result}</div>
					</section>
				)}
				<div className={style.send_area}>
					<div className={style.send_button}>
						{isLoading ? (
							<FiLoader style={{ fontSize: "1.5rem" }} className={`loader`} />
						) : (
							<button onClick={handleSend}>Vytvořit</button>
						)}
					</div>
					<span className={style.left}>Zbývá <b>{uses}</b> generování</span>
				</div>
			</div>
		</section>
	);
}
