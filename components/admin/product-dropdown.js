"use client";

import { useState } from "react";
import Link from "next/link";
import style from "@styles/admin.module.css";

export default function ProductDropdownComponent({ products }) {
	const [activeProduct, setActiveProduct] = useState(null);
	const [activeSubject, setActiveSubject] = useState(null);

	const handleProductClick = (productIndex) => {
		setActiveProduct(activeProduct === productIndex ? null : productIndex);
	};

	const handleSubjectClick = (subjectIndex) => {
		setActiveSubject(activeSubject === subjectIndex ? null : subjectIndex);
	};

	return (
		<div className={style.products_container}>
			{products.map((product, productIndex) => (
				<div key={productIndex}>
					<div
						onClick={() => handleProductClick(productIndex)}
						style={{ cursor: "pointer", fontWeight: "bold" }}
					>
						<h2>{product.name}</h2>
					</div>
					{activeProduct === productIndex && (
						<div className={style.subjects_container}>
							{product.subject.map((subject, subjectIndex) => (
								<div key={subjectIndex}>
									<div
										onClick={() => handleSubjectClick(subjectIndex)}
										style={{ cursor: "pointer", fontWeight: "bold" }}
									>
										<h3>{subject.name}</h3>
									</div>
									{activeSubject === subjectIndex && (
										<div className={style.chapter_container}>
											{subject.chapter.map((chapter, chapterIndex) => (
												<div className={style.chapter_item} key={chapterIndex}>
													<div>
														<h4>{chapter.name}</h4>
														<p>{chapter.description}</p>
													</div>
													<div>
														<a href={`/admin/kapitola/${chapter.id}`}>
															Upravit
														</a>
													</div>
												</div>
											))}
											<a
												href={`/admin/nova-kapitola?p=${subject.id}`}
												className={style.add}
											>
												Přidat novou kapitolu
											</a>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			))}
			
		</div>
	);
}
