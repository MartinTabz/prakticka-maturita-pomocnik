import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import SubjectComponent from "@components/subject";

export default async function SubjectPage({ params: { subject } }) {
	if (!subject) {
		notFound();
	}
	const supabase = createServerComponentClient({ cookies });
	const { data: chapters } = await supabase
		.from("chapter")
		.select("*,  subject_id!inner(slug)")
		.eq("subject_id.slug", subject)
		.order("rank", { ascending: true });
	return (
		<section>
			<SubjectComponent chapters={chapters} />
		</section>
	);
}
