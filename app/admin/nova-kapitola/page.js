import { getServiceSupabase } from "@utils/supabase";
import NewChapterComponent from "@components/admin/new-chapter-component";

export const dynamic = "force-dynamic";

export default async function NewChapterPage({ searchParams: { p } }) {
	const supabase = getServiceSupabase();
	const { data: products } = await supabase
		.from("product")
		.select(`name, subject(name, id)`);

	var selectedSubject = null;

	if (p) {
		const { data: subject } = await supabase
			.from("subject")
			.select("name, id")
			.eq("id", p)
			.single();

		if(subject != null) {
			selectedSubject = subject
		}
	}

	return (
		<>
			<NewChapterComponent products={products} selectedSubject={selectedSubject} />
		</>
	);
}
