"use client";

import { useState } from "react";
import Link from "next/link";

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
		<div>
			{products.map((product, productIndex) => (
				<div key={productIndex}>
					<div
						onClick={() => handleProductClick(productIndex)}
						style={{ cursor: "pointer", fontWeight: "bold" }}
					>
						<h2>{product.name}</h2>
					</div>
					{activeProduct === productIndex && (
						<div>
							{product.subject.map((subject, subjectIndex) => (
								<div key={subjectIndex}>
									<div
										onClick={() => handleSubjectClick(subjectIndex)}
										style={{ cursor: "pointer", fontWeight: "bold" }}
									>
										<h3>{subject.name}</h3>
									</div>
									{activeSubject === subjectIndex && (
										<div>
											{subject.chapter.map((chapter, chapterIndex) => (
												<div key={chapterIndex}>
													<h4>{chapter.name}</h4>
													<p>{chapter.description}</p>
													<Link href={`/admin/kapitola/${chapter.id}`}>
														Upravit
													</Link>
												</div>
											))}
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
