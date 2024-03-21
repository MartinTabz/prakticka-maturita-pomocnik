"use client";

import { useState, useEffect } from "react";

export default function SubjectComponent({ chapters }) {
	const [activeChapter, setActiveChapter] = useState({});

	useEffect(() => {
		if (chapters.length > 0) {
			setActiveChapter(chapters[0]);
		} else {
			setActiveChapter({});
		}
	}, []);

	return (
		<div>
			{chapters.length > 0 ? (
				<div>
					<div>
						{chapters.map((chapter) => (
							<button
								onClick={() => {
									setActiveChapter(chapter);
								}}
								key={chapter.id}
							>
								{chapter.name}
							</button>
						))}
					</div>

					<div>
						<h2>{activeChapter.name}</h2>
						<p>{activeChapter.description}</p>
						<br />
						<div dangerouslySetInnerHTML={{ __html: activeChapter.html }} />
					</div>
				</div>
			) : (
				<div>Nenachází se zde žádný obsah</div>
			)}
		</div>
	);
}
