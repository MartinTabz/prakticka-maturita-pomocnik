import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import SubjectComponent from "@components/subject";

export default async function SubjectPage({ params: { subject, slug } }) {
	if (!subject) {
		notFound();
	}
	const supabase = createServerComponentClient({ cookies });
	const { data: chapters } = await supabase
		.from("chapter")
		.select("*,  subject_id!inner(slug)")
		.eq("subject_id.slug", subject)
		.order("rank", { ascending: true });
	const { data: subjectData } = await supabase
		.from("subject")
		.select("name,description")
		.eq("slug", subject)
		.single();

	if (!subject) {
		throw new Error("Předmět neexistuje");
	}

	return <SubjectComponent chapters={chapters} product={slug} subject={subjectData} />;
}
