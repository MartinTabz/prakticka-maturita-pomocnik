import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default async function ProduktPage({ params: { slug } }) {
	const supabase = createServerComponentClient({ cookies });
	const { data: subjects } = await supabase
		.from("subject")
		.select("*,  product_id!inner(slug)")
		.eq("product_id.slug", slug);
	return (
		<>
         <hr />
         <br />
         <h2>Předměty</h2>
         <div>{subjects.map((subject) => (
            <div key={subject.id}>
               <div>{subject.image && <img src="" />}</div>
               <h3>{subject.name}</h3>
               <p>{subject.description}</p>
               <Link href={`/produkt/${slug}/${subject.slug}`}>Otevřít</Link>
            </div>
         ))}</div>
		</>
	);
}
