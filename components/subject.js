"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa6";
import style from "@styles/chapters.module.css";
import HtmlContent from "./html-content";

export default function SubjectComponent({ chapters, product, subject }) {
	const [isLoading, setIsLoading] = useState(true);
	const [activeChapter, setActiveChapter] = useState({});
	useEffect(() => {
		console.log(chapters);
		if (chapters.length > 0) {
			setActiveChapter(chapters[0]);
			setIsLoading(false);
		} else {
			setActiveChapter({});
		}
	}, [chapters]);

	const handleChapterClick = (chapter) => {
		setIsLoading(true);
		setActiveChapter(chapter);
		setIsLoading(false);
	};

	return (
		<section className={style.section}>
			<div className={style.inner}>
				<nav className={style.back}>
					<div>
						<h1>{subject.name}</h1>
						<p>{subject.description}</p>
					</div>
					<Link href={`/produkt/${product}`}>
						<FaAngleLeft />
						Zpět na předměty
					</Link>
				</nav>
				<div>
					{chapters.length > 0 ? (
						<div>
							<div className={style.switch}>
								{chapters.map((chapter) => (
									<button
										onClick={() => handleChapterClick(chapter)}
										key={chapter.id}
									>
										{chapter.name}
									</button>
								))}
							</div>
							<div className={style.chapter_desc}>
								<h2>{activeChapter.name}</h2>
								<p>{activeChapter.description}</p>
							</div>
							<hr className={style.cara} />
							<div className={style.content}>
								{activeChapter.id == "ca6445ff-3751-4e40-9a0e-455e274c2046" && (
									<a className={style.sql} href="/vytvarec-sql-prikazu">Vytvářeč SQL příkazů</a>
								)}
								{isLoading ? (
									<span>Načítá se</span>
								) : (
									<HtmlContent
										key={activeChapter.id}
										html={activeChapter.html}
									/>
								)}
							</div>
						</div>
					) : (
						<span>Nenachází se zde žádný obsah</span>
					)}
				</div>
			</div>
		</section>
	);
}
