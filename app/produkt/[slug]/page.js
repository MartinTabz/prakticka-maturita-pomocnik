import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import style from "@styles/productdetail.module.css";
import { FaAngleLeft } from "react-icons/fa";
import Image from "next/image";

export default async function ProduktPage({ params: { slug } }) {
	const supabase = createServerComponentClient({ cookies });
	const { data: subjects } = await supabase
		.from("subject")
		.select("*,  product_id!inner(*)")
		.eq("product_id.slug", slug);

	const { data: product } = await supabase
		.from("product")
		.select("name, description")
		.eq("slug", slug)
		.single();

	return (
		<section className={style.section}>
			<div className={style.inner}>
				<nav className={style.back}>
					<Link href={"/produkty"}>
						<FaAngleLeft />
						Zpět na produkty
					</Link>
				</nav>
				<div className={style.header_cont}>
					<h1>{product.name}</h1>
					<p>{product.description}</p>
				</div>
				<div className={style.sub_cont}>
					<h2>Předměty</h2>
					<section className={style.sub_grid}>
						{subjects.length > 0 ? (
							subjects.map((subject) => (
								<div className={style.sub} key={subject.id}>
									<div className={style.sub_imgarea}>
										{subject.image ? (
											<Image
												src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/subjects/${subject.image}`}
												width={400}
												height={150}
												alt="Obrázek předmětu"
											/>
										) : (
											<span>?</span>
										)}
									</div>
									<div className={style.sub_txtarea}>
										<div>
											<h3>{subject.name}</h3>
											<p>{subject.description}</p>
										</div>
										<Link href={`/produkt/${slug}/${subject.slug}`}>
											Otevřít
										</Link>
									</div>
								</div>
							))
						) : (
							<span>Zatím se zde nenachází žádné předměty</span>
						)}
					</section>
				</div>
			</div>
		</section>
	);
}
